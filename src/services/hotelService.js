// src/services/hotelService.js
import apiRequest, { authRequest } from './api';

export const hotelService = {
  // Get hotel statistics
  getStats: (token) => authRequest('/hotel/stats', { method: 'GET' }, token),
  
  // Get all rooms
  getRooms: (token) => authRequest('/hotel/rooms', { method: 'GET' }, token),
  
  // Add new room
  addRoom: (roomData, token) => authRequest('/hotel/rooms', {
    method: 'POST',
    body: JSON.stringify(roomData),
  }, token),
  
  // Update room status
  updateRoomStatus: (roomId, status, maintenanceReason, token) => authRequest(`/hotel/rooms/${roomId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, maintenance_reason: maintenanceReason }),
  }, token),
  
  // Get all staff
  getStaff: (token) => authRequest('/hotel/staff', { method: 'GET' }, token),
  
  // Add new staff
  addStaff: (staffData, token) => authRequest('/hotel/staff', {
    method: 'POST',
    body: JSON.stringify(staffData),
  }, token),
};