// frontend/src/pages/client/NewBooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiCalendar, FiUsers, FiDollarSign, FiClock, FiCheckCircle, 
  FiMapPin, FiStar, FiWifi, FiTv, FiCoffee, FiWind, FiShield,
  FiCreditCard, FiPhone, FiArrowRight, FiInfo, FiHome, FiPlus
} from "react-icons/fi";

const NewBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const preselectedHotelId = queryParams.get('hotel');
  
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    hotelId: preselectedHotelId || "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomId: "",
    roomType: "",
    specialRequests: ""
  });
  
  const [priceDetails, setPriceDetails] = useState({
    nights: 0,
    pricePerNight: 0,
    total: 0,
    currency: "RWF"
  });
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [step, setStep] = useState(1); // 1: Hotel, 2: Room, 3: Payment

  const token = localStorage.getItem("clientToken") || localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("clientUser") || "{}");

  // Load hotels from API
  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/client/hotels", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHotels(data);
        } else {
          // Fallback data
          setHotels([
            { hotel_id: 1, hotel_name: "Kigali Serena Hotel", city: "Kigali", description: "Luxury hotel in the heart of Kigali", image: "🏨", rating: 4.8 },
            { hotel_id: 2, hotel_name: "One&Only Nyungwe House", city: "Nyungwe", description: "Luxury eco-lodge in the rainforest", image: "🌳", rating: 4.9 },
            { hotel_id: 3, hotel_name: "Lake Kivu Serena", city: "Rubavu", description: "Beautiful lakefront resort", image: "🏖️", rating: 4.7 },
            { hotel_id: 4, hotel_name: "Volcano View Lodge", city: "Musanze", description: "Stunning views of the volcanoes", image: "🏔️", rating: 4.8 }
          ]);
        }
      } catch (err) {
        console.error('Error loading hotels:', err);
        setError('Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, [token]);

  // Load rooms when hotel is selected
  useEffect(() => {
    if (formData.hotelId) {
      loadRooms();
    }
  }, [formData.hotelId]);

  useEffect(() => {
    calculatePrice();
  }, [formData.checkIn, formData.checkOut, selectedRoom]);

  const loadRooms = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/client/hotels/${formData.hotelId}/rooms`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        // Fallback rooms
        setRooms([
          { room_id: 1, room_number: "101", room_type: "Standard", capacity: 2, price_per_night: 120000, amenities: ["WiFi", "TV", "AC"], description: "Comfortable standard room with city view", status: "available" },
          { room_id: 2, room_number: "201", room_type: "Deluxe", capacity: 3, price_per_night: 180000, amenities: ["WiFi", "TV", "AC", "Mini Bar"], description: "Spacious deluxe room with balcony", status: "available" },
          { room_id: 3, room_number: "301", room_type: "Suite", capacity: 4, price_per_night: 280000, amenities: ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi"], description: "Luxury suite with separate living area", status: "available" }
        ]);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  const calculatePrice = () => {
    if (!formData.checkIn || !formData.checkOut || !selectedRoom) {
      setPriceDetails({ nights: 0, pricePerNight: 0, total: 0, currency: "RWF" });
      return;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      setPriceDetails({ nights: 0, pricePerNight: 0, total: 0, currency: "RWF" });
      return;
    }

    const pricePerNight = selectedRoom.price_per_night || 0;
    const total = pricePerNight * nights;
    
    setPriceDetails({
      nights,
      pricePerNight,
      total,
      currency: "RWF"
    });
  };

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    setFormData(prev => ({ ...prev, hotelId: hotel.hotel_id }));
    setStep(2);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setFormData(prev => ({ 
      ...prev, 
      roomId: room.room_id, 
      roomType: room.room_type 
    }));
    setStep(3);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = () => {
    if (!formData.checkIn || !formData.checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }
    if (priceDetails.nights <= 0) {
      alert("Check-out date must be after check-in date");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSelection = (type, accountKey) => {
    // For demo, use static payment details
    if (type === 'bank') {
      setPaymentType('bank');
      setSelectedAccount({
        bank: "Bank of Kigali",
        account: "1100 1234 5678 9012",
        holder: selectedHotel?.hotel_name || "Hotel Name"
      });
      setSelectedPaymentMethod("Bank Transfer");
    } else if (type === 'momo') {
      setPaymentType('momo');
      setSelectedAccount({
        provider: "MTN Mobile Money",
        number: "0788 123 456",
        holder: selectedHotel?.hotel_name || "Hotel Name"
      });
      setSelectedPaymentMethod("Mobile Money");
    }
  };

  const confirmBooking = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const bookingData = {
      hotel_id: formData.hotelId,
      room_id: formData.roomId,
      check_in_date: formData.checkIn,
      check_out_date: formData.checkOut,
      number_of_guests: formData.guests,
      room_type: selectedRoom.room_type,
      total_amount: priceDetails.total,
      special_requests: formData.specialRequests,
      status: "pending"
    };

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/client/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const booking = await response.json();
        setBookingSubmitted(true);
        setShowPaymentModal(false);
        
        const formattedTotal = priceDetails.total?.toLocaleString() || '0';
        
        alert(`✅ Booking Request Sent!\n\nBooking ID: ${booking.booking_number || 'Pending'}\nHotel: ${selectedHotel?.hotel_name}\nRoom: ${selectedRoom.room_type} (Room ${selectedRoom.room_number})\nCheck-in: ${formData.checkIn}\nCheck-out: ${formData.checkOut}\nNights: ${priceDetails.nights}\nGuests: ${formData.guests}\nTotal: RWF ${formattedTotal}\n\n📋 Payment Instructions:\n${paymentType === 'bank' ? 'Bank Transfer' : 'Mobile Money'}: ${selectedPaymentMethod}\nAccount: ${selectedAccount?.account || selectedAccount?.number}\nHolder: ${selectedAccount?.holder}\n\n⚠️ Please complete the payment and the hotel will confirm your booking.\nYou can track your booking status in "My Bookings".`);
        
        navigate("/client/bookings");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create booking");
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      'WiFi': <FiWifi size={14} />,
      'TV': <FiTv size={14} />,
      'AC': <FiWind size={14} />,
      'Mini Bar': <FiCoffee size={14} />,
      'Jacuzzi': <FiPlus size={14} />,
      'Breakfast': <FiCoffee size={14} />
    };
    return icons[amenity] || <FiCheckCircle size={14} />;
  };

  if (loading && hotels.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading hotels...</p>
        <style>{`
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f4f6;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3>{error}</h3>
        <button onClick={() => window.location.reload()} style={styles.retryBtn}>
          Try Again
        </button>
      </div>
    );
  }

  // Step 1: Hotel Selection
  if (step === 1) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>🏨 Select Your Hotel</h2>
          <p style={styles.subtitle}>Choose from Rwanda's finest accommodations</p>
        </div>

        <div style={styles.hotelGrid}>
          {hotels.map(hotel => (
            <div key={hotel.hotel_id} style={styles.hotelCard} onClick={() => handleHotelSelect(hotel)}>
              <div style={styles.hotelImage}>
                <span style={styles.hotelImageEmoji}>{hotel.image || '🏨'}</span>
              </div>
              <div style={styles.hotelContent}>
                <div style={styles.hotelHeader}>
                  <h3 style={styles.hotelName}>{hotel.hotel_name}</h3>
                  <div style={styles.hotelRating}>
                    <FiStar size={14} color="#f59e0b" />
                    <span>{hotel.rating || 4.5}</span>
                  </div>
                </div>
                <div style={styles.hotelLocation}>
                  <FiMapPin size={12} /> {hotel.city}
                </div>
                <p style={styles.hotelDescription}>{hotel.description || "Experience luxury and comfort at this premium hotel"}</p>
                <button style={styles.selectBtn}>Select Hotel →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Room Selection
  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => setStep(1)} style={styles.backBtn}>← Back to Hotels</button>
          <h2 style={styles.title}>🛏️ Select Your Room</h2>
          <p style={styles.subtitle}>{selectedHotel?.hotel_name} - {selectedHotel?.city}</p>
        </div>

        <div style={styles.roomGrid}>
          {rooms.filter(r => r.status === 'available').map(room => (
            <div key={room.room_id} style={styles.roomCard}>
              <div style={styles.roomHeader}>
                <div style={styles.roomTypeIcon}>
                  {room.room_type === 'Standard' ? '🛏️' : room.room_type === 'Deluxe' ? '✨' : room.room_type === 'Suite' ? '👑' : '💼'}
                </div>
                <div>
                  <h3 style={styles.roomType}>{room.room_type}</h3>
                  <div style={styles.roomNumber}>Room {room.room_number}</div>
                </div>
                <div style={styles.roomPrice}>
                  <span style={styles.priceAmount}>RWF {room.price_per_night?.toLocaleString()}</span>
                  <span style={styles.pricePeriod}>/ night</span>
                </div>
              </div>
              
              <div style={styles.roomDetails}>
                <div style={styles.roomCapacity}>
                  <FiUsers size={14} /> Max {room.capacity} guests
                </div>
                <div style={styles.roomFloor}>
                  <FiHome size={14} /> Floor {room.floor || 1}
                </div>
              </div>
              
              <div style={styles.amenities}>
                {room.amenities?.slice(0, 4).map((amenity, idx) => (
                  <span key={idx} style={styles.amenityTag}>
                    {getAmenityIcon(amenity)} {amenity}
                  </span>
                ))}
                {room.amenities?.length > 4 && (
                  <span style={styles.amenityTag}>+{room.amenities.length - 4} more</span>
                )}
              </div>
              
              <p style={styles.roomDescription}>{room.description || `Experience comfort in our ${room.room_type} room with amazing views.`}</p>
              
              <button style={styles.selectRoomBtn} onClick={() => handleRoomSelect(room)}>
                Select Room →
              </button>
            </div>
          ))}
        </div>

        {rooms.filter(r => r.status === 'available').length === 0 && (
          <div style={styles.noRooms}>
            <p>No available rooms for this hotel. Please try another hotel.</p>
            <button onClick={() => setStep(1)} style={styles.backBtn}>Back to Hotels</button>
          </div>
        )}
      </div>
    );
  }

  // Step 3: Booking Form & Payment
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => setStep(2)} style={styles.backBtn}>← Back to Rooms</button>
        <h2 style={styles.title}>📝 Complete Your Booking</h2>
        <p style={styles.subtitle}>Review your selection and proceed</p>
      </div>

      <div style={styles.twoColumn}>
        {/* Booking Form */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Booking Details</h3>

          <div style={styles.selectedInfo}>
            <div style={styles.selectedHotelInfo}>
              <span style={styles.hotelIcon}>{selectedHotel?.image || '🏨'}</span>
              <div>
                <div style={styles.selectedHotelName}>{selectedHotel?.hotel_name}</div>
                <div style={styles.selectedRoomType}>{selectedRoom?.room_type} Room</div>
              </div>
            </div>
          </div>

          <label style={styles.label}>Check-in Date</label>
          <input
            style={styles.input}
            type="date"
            value={formData.checkIn}
            onChange={(e) => handleInputChange("checkIn", e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />

          <label style={styles.label}>Check-out Date</label>
          <input
            style={styles.input}
            type="date"
            value={formData.checkOut}
            onChange={(e) => handleInputChange("checkOut", e.target.value)}
            min={formData.checkIn || new Date().toISOString().split('T')[0]}
          />

          <label style={styles.label}>Number of Guests</label>
          <input
            style={styles.input}
            type="number"
            min="1"
            max={selectedRoom?.capacity || 10}
            value={formData.guests}
            onChange={(e) => handleInputChange("guests", parseInt(e.target.value))}
          />

          <label style={styles.label}>Special Requests (Optional)</label>
          <textarea
            style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
            placeholder="Any special requests? (dietary, accessibility, etc.)"
            value={formData.specialRequests}
            onChange={(e) => handleInputChange("specialRequests", e.target.value)}
          />
        </div>

        {/* Price Summary */}
        <div style={styles.summaryCard}>
          <h3 style={styles.sectionTitle}>💰 Price Summary</h3>
          
          <div style={styles.priceBreakdown}>
            <div style={styles.priceRow}>
              <span>Room</span>
              <span>{selectedRoom?.room_type} (Room {selectedRoom?.room_number})</span>
            </div>
            <div style={styles.priceRow}>
              <span>Price per night</span>
              <span>RWF {priceDetails.pricePerNight?.toLocaleString()}</span>
            </div>
            <div style={styles.priceRow}>
              <span>Number of nights</span>
              <span>{priceDetails.nights || 0}</span>
            </div>
            <div style={styles.priceRow}>
              <span>Guests</span>
              <span>{formData.guests} person(s)</span>
            </div>
            <div style={styles.divider}></div>
            <div style={{ ...styles.priceRow, fontSize: "20px", fontWeight: "bold", marginTop: "8px" }}>
              <span>Total Amount</span>
              <span style={{ color: "#2563eb" }}>
                RWF {priceDetails.total?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          <button style={styles.bookButton} onClick={handleProceedToPayment}>
            Proceed to Payment →
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedHotel && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span>💳 Select Payment Method</span>
              <button style={styles.modalClose} onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalAmount}>
                Amount to Pay: <strong>RWF {priceDetails.total?.toLocaleString() || 0}</strong>
              </div>

              {/* Bank Transfer Option */}
              <div style={styles.paymentSection}>
                <h4>🏦 Bank Transfer</h4>
                <div style={styles.paymentOptions}>
                  <button
                    style={{
                      ...styles.paymentOption,
                      border: selectedPaymentMethod === "Bank Transfer" ? "2px solid #10b981" : "1px solid #e5e7eb",
                      background: selectedPaymentMethod === "Bank Transfer" ? "#f0fdf4" : "white"
                    }}
                    onClick={() => handlePaymentSelection('bank')}
                  >
                    <div style={styles.paymentIcon}>🏦 Bank of Kigali</div>
                    <div style={styles.paymentDetails}>
                      Account: 1100 1234 5678 9012<br/>
                      Holder: {selectedHotel.hotel_name}
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Money Options */}
              <div style={styles.paymentSection}>
                <h4>📱 Mobile Money</h4>
                <div style={styles.paymentOptions}>
                  <button
                    style={{
                      ...styles.paymentOption,
                      border: selectedPaymentMethod === "Mobile Money" ? "2px solid #10b981" : "1px solid #e5e7eb",
                      background: selectedPaymentMethod === "Mobile Money" ? "#f0fdf4" : "white"
                    }}
                    onClick={() => handlePaymentSelection('momo')}
                  >
                    <div style={styles.paymentIcon}>📱 MTN Mobile Money</div>
                    <div style={styles.paymentDetails}>
                      Number: 0788 123 456<br/>
                      Holder: {selectedHotel.hotel_name}
                    </div>
                  </button>
                  <button
                    style={{
                      ...styles.paymentOption,
                      border: selectedPaymentMethod === "Airtel Money" ? "2px solid #10b981" : "1px solid #e5e7eb",
                      background: selectedPaymentMethod === "Airtel Money" ? "#f0fdf4" : "white"
                    }}
                    onClick={() => {
                      setPaymentType('momo');
                      setSelectedAccount({
                        provider: "Airtel Money",
                        number: "0788 123 456",
                        holder: selectedHotel.hotel_name
                      });
                      setSelectedPaymentMethod("Airtel Money");
                    }}
                  >
                    <div style={styles.paymentIcon}>📱 Airtel Money</div>
                    <div style={styles.paymentDetails}>
                      Number: 0788 123 456<br/>
                      Holder: {selectedHotel.hotel_name}
                    </div>
                  </button>
                </div>
              </div>

              <button 
                style={styles.confirmButton}
                onClick={confirmBooking}
                disabled={!selectedPaymentMethod || loading}
              >
                {loading ? "Processing..." : "✓ Confirm Booking"}
              </button>
              
              <p style={styles.paymentNote}>
                <FiInfo size={12} /> After confirming, the hotel will review your booking. 
                Please complete the payment and the hotel will approve your stay.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    background: "#f3f4f6",
    minHeight: "100vh"
  },
  header: {
    marginBottom: "24px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#111827"
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#667eea",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  hotelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px"
  },
  hotelCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  hotelImage: {
    height: "160px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  hotelImageEmoji: {
    fontSize: "64px"
  },
  hotelContent: {
    padding: "20px"
  },
  hotelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  hotelName: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#1f2937"
  },
  hotelRating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "13px",
    color: "#f59e0b"
  },
  hotelLocation: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  hotelDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px",
    lineHeight: "1.5"
  },
  selectBtn: {
    width: "100%",
    padding: "10px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500"
  },
  roomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px"
  },
  roomCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.3s"
  },
  roomHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  roomTypeIcon: {
    fontSize: "32px"
  },
  roomType: {
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
    color: "#1f2937"
  },
  roomNumber: {
    fontSize: "12px",
    color: "#6b7280"
  },
  roomPrice: {
    marginLeft: "auto",
    textAlign: "right"
  },
  priceAmount: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2563eb"
  },
  pricePeriod: {
    fontSize: "11px",
    color: "#6b7280"
  },
  roomDetails: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
    fontSize: "13px",
    color: "#6b7280"
  },
  amenities: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px"
  },
  amenityTag: {
    padding: "4px 10px",
    background: "#f3f4f6",
    borderRadius: "20px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#374151"
  },
  roomDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px",
    lineHeight: "1.5"
  },
  selectRoomBtn: {
    width: "100%",
    padding: "10px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500"
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px"
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  summaryCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    position: "sticky",
    top: "24px",
    height: "fit-content"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#111827"
  },
  selectedInfo: {
    marginBottom: "20px",
    padding: "16px",
    background: "#f8f9fa",
    borderRadius: "12px"
  },
  selectedHotelInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  hotelIcon: {
    fontSize: "32px"
  },
  selectedHotelName: {
    fontWeight: "600",
    color: "#1f2937"
  },
  selectedRoomType: {
    fontSize: "13px",
    color: "#6b7280"
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none"
  },
  priceBreakdown: {
    marginBottom: "24px"
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
    color: "#4b5563"
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "12px 0"
  },
  bookButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "white",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "80vh",
    overflow: "auto"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "18px",
    fontWeight: "600"
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280"
  },
  modalBody: {
    padding: "20px"
  },
  modalAmount: {
    background: "#f0fdf4",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "16px"
  },
  paymentSection: {
    marginBottom: "24px"
  },
  paymentOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "12px"
  },
  paymentOption: {
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    background: "white",
    transition: "all 0.2s"
  },
  paymentIcon: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px"
  },
  paymentDetails: {
    fontSize: "13px",
    color: "#6b7280"
  },
  confirmButton: {
    width: "100%",
    padding: "14px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px"
  },
  paymentNote: {
    fontSize: "11px",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px"
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
    margin: '24px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
    margin: '24px',
    color: '#dc2626'
  },
  retryBtn: {
    marginTop: '16px',
    padding: '10px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  noRooms: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px'
  }
};

export default NewBooking;