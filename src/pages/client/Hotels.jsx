import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar, FiFilter, FiHeart } from 'react-icons/fi';
import { hotelAPI } from '../../services/api';

const Hotels = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [rating, setRating] = useState('all');
  const [location, setLocation] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load hotels from database API
  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        const data = await hotelAPI.getAll();
        // Ensure data is an array and has required properties
        const validHotels = (data || []).map(hotel => ({
          id: hotel.id || hotel.hotel_id || Math.random(),
          name: hotel.name || hotel.hotel_name || 'Unknown Hotel',
          location: hotel.city || hotel.location || 'Unknown Location',
          price: hotel.price || hotel.price_per_night_usd || 100,
          priceRWF: hotel.priceRWF || hotel.price_per_night_rwf || 100000,
          rating: hotel.rating || 4.0,
          image: hotel.image || '🏨',
          amenities: hotel.amenities || ['WiFi', 'Parking', 'Restaurant']
        }));
        setHotels(validHotels);
        setError(null);
      } catch (err) {
        console.error('Error loading hotels:', err);
        setError('Failed to load hotels. Please try again later.');
        // Fallback data
        setHotels([
          { id: 1, name: "Kigali Serena Hotel", location: "Kigali", price: 180, priceRWF: 120000, rating: 4.8, image: "🏨", amenities: ['Pool', 'Spa', 'Restaurant'] },
          { id: 2, name: "One&Only Nyungwe House", location: "Nyungwe", price: 420, priceRWF: 420000, rating: 4.9, image: "🌳", amenities: ['Forest View', 'Luxury Spa', 'Fine Dining'] },
          { id: 3, name: "Lake Kivu Serena", location: "Rubavu", price: 140, priceRWF: 200000, rating: 4.5, image: "🏖️", amenities: ['Lake View', 'Beach Access', 'Water Sports'] },
          { id: 4, name: "Volcano View Lodge", location: "Musanze", price: 210, priceRWF: 280000, rating: 4.7, image: "🏔️", amenities: ['Mountain View', 'Gorilla Trekking', 'Fireplace'] },
          { id: 5, name: "Radisson Blu Kigali", location: "Kigali", price: 195, priceRWF: 250000, rating: 4.6, image: "🏨", amenities: ['Convention Center', 'Pool', 'Gym'] },
          { id: 6, name: "Mountain Gorilla Lodge", location: "Musanze", price: 350, priceRWF: 450000, rating: 4.8, image: "🏔️", amenities: ['Volcano Views', 'Guided Tours', 'Local Cuisine'] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  // Load favorites from localStorage or database
  useEffect(() => {
    const savedFavorites = localStorage.getItem('hotel_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('hotel_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (hotelId) => {
    if (favorites.includes(hotelId)) {
      setFavorites(favorites.filter(id => id !== hotelId));
    } else {
      setFavorites([...favorites, hotelId]);
    }
  };

  const handleBookNow = (hotelId) => {
    navigate(`/client/new-booking?hotel=${hotelId}`);
  };

  // SAFE FILTERING - Add null/undefined checks
  const filteredHotels = hotels.filter(hotel => {
    // Skip if hotel or required properties are undefined
    if (!hotel || !hotel.name || !hotel.location) return false;
    
    const matchesSearch = searchTerm === '' || 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = location === 'all' || hotel.location === location;
    
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'budget' && hotel.price < 150) || 
      (priceRange === 'mid' && hotel.price >= 150 && hotel.price <= 250) || 
      (priceRange === 'luxury' && hotel.price > 250);
    
    const matchesRating = rating === 'all' || 
      (rating === '4plus' && hotel.rating >= 4) || 
      (rating === '4.5plus' && hotel.rating >= 4.5);
    
    return matchesSearch && matchesLocation && matchesPrice && matchesRating;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏨 Browse Hotels</h1>
          <p style={styles.subtitle}>Find the perfect stay in Rwanda</p>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading hotels...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏨 Browse Hotels</h1>
          <p style={styles.subtitle}>Find the perfect stay in Rwanda</p>
        </div>
        <div style={styles.errorContainer}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3>{error}</h3>
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏨 Browse Hotels</h1>
        <p style={styles.subtitle}>Find the perfect stay in Rwanda</p>
      </div>

      {/* Search and Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <FiSearch style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by hotel name or location..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput} 
          />
        </div>
        <select value={location} onChange={(e) => setLocation(e.target.value)} style={styles.select}>
          <option value="all">All Locations</option>
          <option value="Kigali">Kigali</option>
          <option value="Musanze">Musanze</option>
          <option value="Rubavu">Rubavu</option>
          <option value="Nyungwe">Nyungwe</option>
        </select>
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} style={styles.select}>
          <option value="all">All Prices</option>
          <option value="budget">Budget (&lt; $150)</option>
          <option value="mid">Mid ($150 - $250)</option>
          <option value="luxury">Luxury (&gt; $250)</option>
        </select>
        <select value={rating} onChange={(e) => setRating(e.target.value)} style={styles.select}>
          <option value="all">All Ratings</option>
          <option value="4plus">4★ & above</option>
          <option value="4.5plus">4.5★ & above</option>
        </select>
      </div>

      {/* Results Count */}
      <p style={styles.resultsCount}>Found {filteredHotels.length} hotels</p>

      {/* Hotels Grid */}
      <div style={styles.hotelsGrid}>
        {filteredHotels.map(hotel => (
          <div key={hotel.id} style={styles.hotelCard}>
            <div style={styles.hotelImage}>
              <span style={{ fontSize: '48px' }}>{hotel.image || '🏨'}</span>
              <button 
                onClick={() => toggleFavorite(hotel.id)} 
                style={styles.favoriteBtn}
              >
                <FiHeart 
                  size={18} 
                  color={favorites.includes(hotel.id) ? '#ef4444' : '#9ca3af'} 
                  fill={favorites.includes(hotel.id) ? '#ef4444' : 'none'} 
                />
              </button>
            </div>
            <div style={styles.hotelInfo}>
              <div style={styles.hotelHeader}>
                <h3 style={styles.hotelName}>{hotel.name}</h3>
                <div style={styles.rating}>
                  <FiStar color="#fbbf24" fill="#fbbf24" />
                  <span>{hotel.rating}</span>
                </div>
              </div>
              <p style={styles.hotelLocation}>
                <FiMapPin size={14} /> {hotel.location}
              </p>
              <div style={styles.amenities}>
                {hotel.amenities && hotel.amenities.slice(0, 3).map((a, i) => (
                  <span key={i} style={styles.amenityTag}>{a}</span>
                ))}
              </div>
              <div style={styles.hotelFooter}>
                <div>
                  <span style={styles.price}>${hotel.price}</span>
                  <span style={styles.perNight}> / night</span>
                  <div style={styles.priceRWF}>RWF {hotel.priceRWF.toLocaleString()}</div>
                </div>
                <button 
                  onClick={() => handleBookNow(hotel.id)} 
                  style={styles.bookButton}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
                >
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <div style={styles.noResults}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3>No hotels found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    background: '#f3f4f6',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#111827'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  filterBar: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  searchWrapper: {
    flex: 2,
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    minWidth: '140px'
  },
  resultsCount: {
    marginBottom: '20px',
    color: '#6b7280',
    fontSize: '14px'
  },
  hotelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  hotelCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer'
  },
  hotelImage: {
    height: '180px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  favoriteBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  hotelInfo: {
    padding: '16px'
  },
  hotelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '8px'
  },
  hotelName: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    color: '#111827'
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#f59e0b'
  },
  hotelLocation: {
    color: '#6b7280',
    fontSize: '13px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  amenities: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  amenityTag: {
    padding: '4px 10px',
    background: '#f3f4f6',
    borderRadius: '20px',
    fontSize: '11px',
    color: '#374151'
  },
  hotelFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f0f2f5',
    paddingTop: '12px'
  },
  price: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#3b82f6'
  },
  perNight: {
    fontSize: '12px',
    color: '#6b7280'
  },
  priceRWF: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px'
  },
  bookButton: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background 0.2s'
  },
  noResults: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
    color: '#6b7280'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
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
  }
};

export default Hotels;