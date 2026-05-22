// src/services/rdbService.js
import { authRequest } from './api';

export const rdbService = {
  // Get pending hotels
  getPendingHotels: (token) => authRequest('/rdb/pending-hotels', { method: 'GET' }, token),
  
  // Approve hotel
  approveHotel: (hotelId, token) => authRequest(`/rdb/hotels/${hotelId}/approve`, { method: 'PUT' }, token),
  
  // Reject hotel
  rejectHotel: (hotelId, reason, token) => authRequest(`/rdb/hotels/${hotelId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }, token),
  
  // Get all hotels
  getAllHotels: (token) => authRequest('/rdb/hotels', { method: 'GET' }, token),
  
  // Get dashboard stats
  getStats: (token) => authRequest('/rdb/stats', { method: 'GET' }, token),
};