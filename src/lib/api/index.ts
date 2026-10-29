// Barrel export – import mọi service từ một nơi:
// import { authService, memberService, ... } from '@/lib/api'

export { default as authService } from './auth/authService';
export { default as memberService } from './modules/memberService';
export { default as packageService } from './modules/packageService';
export { default as attendanceService } from './modules/attendanceService';
export { default as trainerService } from './modules/trainerService';
export { default as employeeService } from './modules/employeeService';
export { default as apiClient } from './core/client';
export { ENDPOINTS } from './endpoints';
