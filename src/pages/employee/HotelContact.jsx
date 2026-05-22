import React, { useState, useEffect } from 'react';

const HotelContact = () => {
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    
    const token = localStorage.getItem('token') || localStorage.getItem('employeeToken');
    
    useEffect(() => {
        if (token) {
            fetchHotelContact();
        } else {
            setError('No authentication token found');
            setLoading(false);
        }
    }, []);
    
    const fetchHotelContact = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('http://localhost:5001/api/employee/hotel-contact', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                setHotel(data.hotel);
            } else {
                setError(data.error || data.message || 'Failed to load hotel contact');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Network error. Please check if server is running.');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePhoneCall = () => {
        if (hotel?.phone) {
            // Format phone number for calling
            let phone = hotel.phone.replace(/\D/g, '');
            if (phone.length === 9) {
                phone = '+250' + phone;
            } else if (!phone.startsWith('+')) {
                phone = '+' + phone;
            }
            window.location.href = `tel:${phone}`;
        }
    };
    
    const handleWhatsApp = () => {
        if (hotel?.phone_raw || hotel?.phone) {
            let phone = hotel.phone_raw || hotel.phone;
            phone = phone.replace(/\D/g, '');
            if (phone.length === 9 && !phone.startsWith('250')) {
                phone = '250' + phone;
            }
            window.open(`https://wa.me/${phone}`, '_blank');
        }
    };
    
    const handleEmail = () => {
        if (hotel?.email) {
            window.location.href = `mailto:${hotel.email}`;
        }
    };
    
    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };
    
    const openMap = () => {
        if (hotel?.full_address) {
            window.open(`https://maps.google.com/?q=${encodeURIComponent(hotel.full_address)}`, '_blank');
        }
    };
    
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading hotel information...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorIcon}>🏨</div>
                <h2>Hotel Contact Not Available</h2>
                <p>{error}</p>
                <button onClick={fetchHotelContact} style={styles.retryButton}>
                    Try Again
                </button>
            </div>
        );
    }
    
    if (!hotel) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorIcon}>📍</div>
                <h2>No Hotel Assignment</h2>
                <p>You are not currently assigned to any hotel. Please contact your administrator.</p>
            </div>
        );
    }
    
    return (
        <div style={styles.container}>
            {/* Hotel Header */}
            <div style={styles.header}>
                <div style={styles.hotelIcon}>🏨</div>
                <h1 style={styles.hotelName}>{hotel.name}</h1>
                {hotel.description && hotel.description !== 'No description available' && (
                    <p style={styles.hotelDescription}>{hotel.description}</p>
                )}
                <div style={styles.addressContainer}>
                    <span style={styles.addressIcon}>📍</span>
                    <span style={styles.addressText}>{hotel.full_address}</span>
                    <button onClick={openMap} style={styles.mapButton}>
                        View on Map
                    </button>
                </div>
            </div>
            
            {/* Contact Cards */}
            <div style={styles.cardsGrid}>
                {/* Email Card */}
                <div style={styles.contactCard}>
                    <div style={styles.cardIcon}>📧</div>
                    <h3 style={styles.cardTitle}>Email Support</h3>
                    <p style={styles.cardValue}>{hotel.email}</p>
                    <div style={styles.buttonGroup}>
                        <button onClick={handleEmail} style={styles.emailButton}>
                            Send Email
                        </button>
                        <button onClick={() => handleCopy(hotel.email, 'email')} style={styles.copyButton}>
                            {copiedField === 'email' ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
                
                {/* Phone Call Card */}
                <div style={styles.contactCard}>
                    <div style={styles.cardIcon}>📞</div>
                    <h3 style={styles.cardTitle}>Phone Call</h3>
                    <p style={styles.cardValue}>{hotel.phone}</p>
                    <div style={styles.buttonGroup}>
                        <button onClick={handlePhoneCall} style={styles.callButton}>
                            Call Now
                        </button>
                        <button onClick={() => handleCopy(hotel.phone, 'phone')} style={styles.copyButton}>
                            {copiedField === 'phone' ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
                
                {/* WhatsApp Card */}
                <div style={styles.contactCard}>
                    <div style={styles.cardIcon}>💬</div>
                    <h3 style={styles.cardTitle}>WhatsApp</h3>
                    <p style={styles.cardValue}>{hotel.phone}</p>
                    <button onClick={handleWhatsApp} style={styles.whatsappButton}>
                        Message on WhatsApp
                    </button>
                </div>
            </div>
            
            {/* Additional Information */}
            <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>📋 Hotel Information</h3>
                <div style={styles.infoList}>
                    <div style={styles.infoItem}>
                        <span>🏨 Hotel Name:</span>
                        <span>{hotel.name}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span>📧 Email:</span>
                        <span>{hotel.email}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span>📞 Phone:</span>
                        <span>{hotel.phone}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span>📍 Address:</span>
                        <span>{hotel.full_address}</span>
                    </div>
                </div>
                <p style={styles.note}>
                    💡 For urgent matters, please call or WhatsApp. For non-urgent inquiries, email is preferred.
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px"
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        color: "#6b7280"
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #e5e7eb",
        borderTop: "4px solid #4f46e5",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "16px"
    },
    errorContainer: {
        textAlign: "center",
        padding: "60px 20px",
        background: "white",
        borderRadius: "16px",
        margin: "20px"
    },
    errorIcon: {
        fontSize: "60px",
        marginBottom: "20px"
    },
    retryButton: {
        background: "#4f46e5",
        color: "white",
        border: "none",
        padding: "10px 24px",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "20px"
    },
    header: {
        textAlign: "center",
        marginBottom: "40px"
    },
    hotelIcon: {
        fontSize: "64px",
        marginBottom: "16px"
    },
    hotelName: {
        fontSize: "32px",
        color: "#111827",
        marginBottom: "12px"
    },
    hotelDescription: {
        color: "#6b7280",
        fontSize: "14px",
        maxWidth: "500px",
        margin: "0 auto 16px"
    },
    addressContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        flexWrap: "wrap"
    },
    addressIcon: {
        fontSize: "16px"
    },
    addressText: {
        color: "#4b5563",
        fontSize: "14px"
    },
    mapButton: {
        background: "transparent",
        color: "#4f46e5",
        border: "1px solid #4f46e5",
        padding: "4px 12px",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "12px"
    },
    cardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginBottom: "32px"
    },
    contactCard: {
        background: "white",
        borderRadius: "20px",
        padding: "28px",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    },
    cardIcon: {
        fontSize: "48px",
        marginBottom: "16px"
    },
    cardTitle: {
        fontSize: "20px",
        color: "#111827",
        marginBottom: "12px"
    },
    cardValue: {
        fontSize: "16px",
        color: "#4b5563",
        marginBottom: "20px",
        wordBreak: "break-all"
    },
    buttonGroup: {
        display: "flex",
        gap: "12px"
    },
    emailButton: {
        flex: 1,
        background: "#4f46e5",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600"
    },
    callButton: {
        flex: 1,
        background: "#10b981",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600"
    },
    copyButton: {
        flex: 1,
        background: "#f3f4f6",
        color: "#374151",
        border: "none",
        padding: "10px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "500"
    },
    whatsappButton: {
        width: "100%",
        background: "#25D366",
        color: "white",
        border: "none",
        padding: "12px 24px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        marginTop: "12px"
    },
    infoCard: {
        background: "white",
        borderRadius: "20px",
        padding: "28px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    },
    infoTitle: {
        fontSize: "18px",
        color: "#111827",
        marginBottom: "20px"
    },
    infoList: {
        marginBottom: "20px"
    },
    infoItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6",
        color: "#4b5563"
    },
    note: {
        fontSize: "13px",
        color: "#9ca3af",
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: "1px solid #f3f4f6"
    }
};

// Add animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default HotelContact;