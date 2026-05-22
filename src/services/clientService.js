// src/services/clientService.js
import apiRequest, { authRequest } from './api';

export const clientService = {
  // Get all hotels
  getHotels: () => apiRequest('/client/hotels', { method: 'GET' }),
  
  // Create booking
  createBooking: (bookingData, token) => authRequest('/client/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }, token),
  
  // Get user bookings
  getUserBookings: (token) => authRequest('/client/bookings', { method: 'GET' }, token),
};