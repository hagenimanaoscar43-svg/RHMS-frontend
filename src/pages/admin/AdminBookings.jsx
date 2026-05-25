// Enhanced version - updates booking status, room availability, and sends email
app.put('/api/hotel/bookings/:bookingId/status', authenticateToken, authorizeRole('hotel_admin'), async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const ALLOWED_STATUSES = ['confirmed', 'cancelled', 'pending', 'completed'];
    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ 
            error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` 
        });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Get hotel info
        const hotel = await client.query(`SELECT hotel_id, hotel_name FROM hotels WHERE user_id = $1`, [req.user.user_id]);
        if (hotel.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Hotel not found' });
        }
        
        // Get booking details with guest info
        const booking = await client.query(`
            SELECT 
                b.*, 
                u.email as guest_email, 
                u.full_name as guest_name,
                u.phone as guest_phone,
                r.room_number,
                r.room_id
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            LEFT JOIN rooms r ON b.room_id = r.room_id
            WHERE b.booking_id = $1 AND b.hotel_id = $2
        `, [bookingId, hotel.rows[0].hotel_id]);
        
        if (booking.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        const bookingData = booking.rows[0];
        
        // Don't allow changing completed or cancelled bookings
        if (['completed', 'cancelled'].includes(bookingData.status) && status !== bookingData.status) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: `Cannot change a ${bookingData.status} booking.` 
            });
        }
        
        // Update booking status
        await client.query(`
            UPDATE bookings 
            SET status = $1, updated_at = NOW()
            WHERE booking_id = $2 AND hotel_id = $3
        `, [status, bookingId, hotel.rows[0].hotel_id]);
        
        // Update room status if room exists
        if (bookingData.room_id) {
            if (status === 'confirmed') {
                // Mark room as booked
                await client.query(`
                    UPDATE rooms 
                    SET status = 'booked', updated_at = NOW()
                    WHERE room_id = $1
                `, [bookingData.room_id]);
            } else if (status === 'cancelled' && bookingData.status !== 'cancelled') {
                // Make room available again
                await client.query(`
                    UPDATE rooms 
                    SET status = 'available', updated_at = NOW()
                    WHERE room_id = $1
                `, [bookingData.room_id]);
            }
        }
        
        await client.query('COMMIT');
        
        // Send email notification to guest (don't await - send in background)
        const statusText = status === 'confirmed' ? 'CONFIRMED' : status.toUpperCase();
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${status === 'confirmed' ? '#10b981' : '#ef4444'}; padding: 20px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Booking ${statusText}</h2>
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb;">
                    <p>Dear ${bookingData.guest_name},</p>
                    <p>Your booking has been <strong>${statusText}</strong>.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p><strong>Booking ID:</strong> ${bookingData.booking_number}</p>
                        <p><strong>Hotel:</strong> ${hotel.rows[0].hotel_name}</p>
                        <p><strong>Room:</strong> ${bookingData.room_number || 'Standard'}</p>
                        <p><strong>Check-in:</strong> ${new Date(bookingData.check_in_date).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> ${new Date(bookingData.check_out_date).toLocaleDateString()}</p>
                        <p><strong>Total Amount:</strong> RWF ${bookingData.final_amount?.toLocaleString()}</p>
                    </div>
                    ${status === 'confirmed' ? 
                        '<p>✅ We look forward to hosting you!</p>' : 
                        '<p>❌ If you have questions, please contact the hotel directly.</p>'}
                </div>
            </div>
        `;
        
        // Send email if sendEmail function exists
        if (typeof sendEmail === 'function') {
            sendEmail(bookingData.guest_email, `Booking ${statusText} - RHMS`, emailHtml)
                .catch(err => console.error('Email error:', err));
        }
        
        res.json({ 
            success: true, 
            message: `Booking ${status === 'confirmed' ? 'approved' : 'cancelled'} successfully`,
            booking_id: bookingId,
            status: status
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status: ' + error.message });
    } finally {
        client.release();
    }
});