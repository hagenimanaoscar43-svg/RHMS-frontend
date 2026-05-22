// src/services/employeeService.js
import { authRequest } from './api';

export const employeeService = {
  // Clock in
  clockIn: (token) => authRequest('/employee/clock-in', { method: 'POST' }, token),
  
  // Clock out
  clockOut: (token) => authRequest('/employee/clock-out', { method: 'PUT' }, token),
  
  // Get attendance history
  getAttendance: (token) => authRequest('/employee/attendance', { method: 'GET' }, token),
  
  // Get salary info
  getSalary: (token) => authRequest('/employee/salary', { method: 'GET' }, token),
};