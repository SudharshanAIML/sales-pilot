import axios from 'axios';
import api from './api';

// Express backend endpoint for delivery tracking (uses main API)
const DELIVERY_API_BASE = import.meta.env.VITE_DELIVERY_API_URL || 'http://localhost:3000/api/delivery';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const deliveryApi = axios.create({
  baseURL: DELIVERY_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
deliveryApi.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  config.headers = { ...config.headers, ...headers };
  return config;
});

// Get all delayed order notifications
export const getNotifications = async (thresholdHours = 24) => {
  try {
    const response = await deliveryApi.get('/notifications', {
      params: { threshold_hours: thresholdHours },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get system status
export const getSystemStatus = async () => {
  try {
    const response = await deliveryApi.get('/status');
    // Status is returned directly in response.data (not in .data.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching system status:', error);
    throw error;
  }
};

// Resend a specific notification
export const resendNotification = async (orderId) => {
  try {
    const response = await deliveryApi.post(`/resend/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error resending notification:', error);
    throw error;
  }
};

// Resend all failed notifications
export const resendAllNotifications = async () => {
  try {
    const response = await deliveryApi.post('/resend-all');
    return response.data;
  } catch (error) {
    console.error('Error resending all notifications:', error);
    throw error;
  }
};

// Trigger the delivery tracking agent
export const runDeliveryAgent = async (thresholdHours = 24) => {
  try {
    const response = await deliveryApi.post('/trigger-agent', {
      threshold_hours: thresholdHours,
    });
    return response.data;
  } catch (error) {
    console.error('Error triggering delivery agent:', error);
    throw error;
  }
};

// Get tracking details for a specific order
export const getTrackingDetails = async (orderId) => {
  try {
    const response = await deliveryApi.get(`/tracking/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getSystemStatus,
  resendNotification,
  resendAllNotifications,
  runDeliveryAgent,
  getTrackingDetails,
};
