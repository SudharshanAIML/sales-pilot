import express from 'express';
import * as deliveryTrackerService from './delivery.service.js';

const router = express.Router();

// Get all delayed order notifications
router.get('/notifications', async (req, res) => {
  try {
    const thresholdHours = req.query.threshold_hours || 24;
    const notifications = await deliveryTrackerService.getDelayedNotifications(thresholdHours);
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
});

// Get system status
router.get('/status', async (req, res) => {
  try {
    const status = await deliveryTrackerService.getSystemStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system status',
      error: error.message,
    });
  }
});

// Resend specific notification
router.post('/resend/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const result = await deliveryTrackerService.resendNotification(notificationId);
    
    res.json({
      success: true,
      message: `Notification ${notificationId} resent successfully`,
      result,
    });
  } catch (error) {
    console.error('Error resending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend notification',
      error: error.message,
    });
  }
});

// Resend all failed notifications
router.post('/resend-all', async (req, res) => {
  try {
    const result = await deliveryTrackerService.resendAllNotifications();
    
    res.json({
      success: true,
      message: 'All failed notifications have been resent',
      result,
    });
  } catch (error) {
    console.error('Error resending all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend notifications',
      error: error.message,
    });
  }
});

// Trigger delivery tracking agent
router.post('/trigger-agent', async (req, res) => {
  try {
    const { threshold_hours = 24 } = req.body;
    const result = await deliveryTrackerService.triggerDeliveryAgent(threshold_hours);
    
    res.json({
      success: true,
      message: 'Delivery tracking agent triggered',
      result,
    });
  } catch (error) {
    console.error('Error triggering delivery agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger delivery agent',
      error: error.message,
    });
  }
});

export default router;
