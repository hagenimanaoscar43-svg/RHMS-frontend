// Update booking status (approve/reject) - Hotel Admin
app.put('/api/hotel/bookings/:bookingId/status', authenticateToken, authorizeRole('hotel_admin'), async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    try {
        const hotel = await pool.query(`SELECT hotel_id FROM hotels WHERE user_id = $1`, [req.user.user_id]);
        if (hotel.rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }
        
        await pool.query(`
            UPDATE bookings 
            SET status = $1, updated_at = NOW()
            WHERE booking_id = $2 AND hotel_id = $3
        `, [status, bookingId, hotel.rows[0].hotel_id]);
        
        res.json({ success: true, message: `Booking ${status === 'confirmed' ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});