import { db } from '../../config/db.js';
import { sendDelayNotificationEmail } from '../../utils/emailService.js';

// Get delayed notifications from database
export const getDelayedNotifications = async (thresholdHours = 24) => {
  try {
    // Get orders where expected_delivery_date is in the past (delayed orders)
    const now = new Date();
    
    console.log('🔍 Checking for delayed orders...');
    console.log('📅 Current time:', now.toISOString());

    const query = `
      SELECT
        o.order_id,
        o.product_name,
        o.expected_delivery_date,
        o.current_status,
        c.customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.company_name,
        nl.reason as delay_reason,
        nl.sent_at as last_notification_sent,
        nl.email_status
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN notifications_log nl ON o.order_id = nl.order_id AND nl.notification_type = 'DELIVERY_DELAY'
      WHERE o.expected_delivery_date < NOW()
        AND o.current_status != 'Delivered'
      ORDER BY o.expected_delivery_date ASC
    `;

    const [rows] = await db.query(query);
    
    console.log(`📦 Found ${rows.length} delayed orders:`, rows.map(r => ({
      order_id: r.order_id,
      customer: r.customer_name,
      email: r.customer_email,
      expected: r.expected_delivery_date
    })));

    // Format response to match frontend expectations
    const notifications = rows.map((row, index) => {
      const delayHours = Math.round(
        (Date.now() - new Date(row.expected_delivery_date)) / (1000 * 60 * 60) * 10
      ) / 10;
      
      return {
        id: `NOTIF${String(index + 1).padStart(3, '0')}`,
        orderId: `ORD${row.order_id}`,
        productName: row.product_name,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        companyName: row.company_name || row.customer_name,
        expectedDeliveryDate: row.expected_delivery_date ? new Date(row.expected_delivery_date).toISOString().split('T')[0] : '',
        currentStatus: row.current_status,
        delayHours: delayHours,
        delayReason: row.delay_reason || 'System delay detected',
        emailSentAt: row.last_notification_sent ? new Date(row.last_notification_sent).toISOString() : new Date().toISOString(),
        emailStatus: row.email_status || 'pending',
        notificationAttempts: row.last_notification_sent ? 1 : 0,
        lastAttempt: row.last_notification_sent ? new Date(row.last_notification_sent).toISOString() : null,
      };
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching delayed notifications:', error);
    throw error;
  }
};

// Get system status
export const getSystemStatus = async () => {
  try {
    const delayedOrders = await getDelayedNotifications(24);

    return {
      systemActive: true,
      lastCheck: new Date().toISOString(),
      delayedOrders: delayedOrders.length,
      failedNotifications: delayedOrders.filter((n) => n.emailStatus === 'failed').length,
    };
  } catch (error) {
    console.error('Error fetching system status:', error);
    throw error;
  }
};

// Resend specific notification
export const resendNotification = async (notificationId) => {
  try {
    // Find notification details and resend email
    const notifications = await getDelayedNotifications(24);
    const notification = notifications.find((n) => n.id === notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Send email
    await sendDelayNotificationEmail({
      to: notification.customerEmail,
      customerName: notification.customerName,
      companyName: notification.companyName,
      orderId: notification.orderId,
      productName: notification.productName,
      delayHours: notification.delayHours,
      delayReason: notification.delayReason,
      expectedDeliveryDate: notification.expectedDeliveryDate,
    });

    // Log notification attempt
    await logNotificationAttempt(notification.orderId, 'DELIVERY_DELAY', 'email_resent');

    return {
      success: true,
      notificationId,
      sentTo: notification.customerEmail,
    };
  } catch (error) {
    console.error('Error resending notification:', error);
    throw error;
  }
};

// Resend all failed notifications
export const resendAllNotifications = async () => {
  try {
    const notifications = await getDelayedNotifications(24);
    const failedNotifications = notifications.filter((n) => n.emailStatus === 'failed');

    const results = [];

    for (const notification of failedNotifications) {
      try {
        await sendDelayNotificationEmail({
          to: notification.customerEmail,
          customerName: notification.customerName,
          companyName: notification.companyName,
          orderId: notification.orderId,
          productName: notification.productName,
          delayHours: notification.delayHours,
          delayReason: notification.delayReason,
          expectedDeliveryDate: notification.expectedDeliveryDate,
        });

        await logNotificationAttempt(notification.orderId, 'DELIVERY_DELAY', 'batch_resent');

        results.push({
          id: notification.id,
          status: 'success',
          email: notification.customerEmail,
        });
      } catch (err) {
        results.push({
          id: notification.id,
          status: 'failed',
          error: err.message,
        });
      }
    }

    return {
      totalAttempted: failedNotifications.length,
      successful: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };
  } catch (error) {
    console.error('Error resending all notifications:', error);
    throw error;
  }
};

// Trigger delivery tracking agent
export const triggerDeliveryAgent = async (thresholdHours = 24) => {
  try {
    console.log('🚀 Triggering delivery agent...');
    const delayedNotifications = await getDelayedNotifications(thresholdHours);
    
    console.log(`📧 Processing ${delayedNotifications.length} notifications...`);

    // Send emails for all delayed orders
    const results = [];

    for (const notification of delayedNotifications) {
      try {
        console.log(`📤 Sending email to ${notification.customerEmail} for order ${notification.orderId}...`);
        
        await sendDelayNotificationEmail({
          to: notification.customerEmail,
          customerName: notification.customerName,
          companyName: notification.companyName,
          orderId: notification.orderId,
          productName: notification.productName,
          delayHours: notification.delayHours,
          delayReason: notification.delayReason,
          expectedDeliveryDate: notification.expectedDeliveryDate,
        });
        
        console.log(`✅ Email sent successfully to ${notification.customerEmail}`);

        await logNotificationAttempt(
          notification.orderId,
          'DELIVERY_DELAY',
          notification.delayReason
        );

        results.push({
          orderId: notification.orderId,
          status: 'sent',
          email: notification.customerEmail,
        });
      } catch (err) {
        results.push({
          orderId: notification.orderId,
          status: 'failed',
          error: err.message,
        });
      }
    }

    return {
      totalProcessed: delayedNotifications.length,
      successfulNotifications: results.filter((r) => r.status === 'sent').length,
      failedNotifications: results.filter((r) => r.status === 'failed').length,
      results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error triggering delivery agent:', error);
    throw error;
  }
};

// Log notification attempt
export const logNotificationAttempt = async (orderId, notificationType, reason, emailStatus = 'sent') => {
  try {
    // Extract numeric order_id from string format (e.g., "ORD1" -> 1)
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId.replace('ORD', '')) : orderId;
    
    const query = `
      INSERT INTO notifications_log (order_id, notification_type, reason, email_status)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(query, [numericOrderId, notificationType, reason, emailStatus]);
  } catch (error) {
    console.error('Error logging notification:', error);
    // Don't throw - logging failures shouldn't block main flow
  }
};
