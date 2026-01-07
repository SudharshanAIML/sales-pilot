import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send invitation email to new employee
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.employeeName - Name of the invited employee
 * @param {string} options.adminName - Name of the admin who sent the invite
 * @param {string} options.companyName - Name of the company
 * @param {string} options.inviteToken - Unique invitation token
 */
export const sendInvitationEmail = async ({ to, employeeName, adminName, companyName, inviteToken }) => {
  const transporter = createTransporter();
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const inviteLink = `${frontendUrl}/login?invite=${inviteToken}`;
  
  const mailOptions = {
    from: {
      name: companyName || 'CRM Platform',
      address: process.env.SMTP_EMAIL,
    },
    to,
    subject: `🎉 You're invited to join ${companyName || 'our CRM'} team!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Join</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to the Team!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hi <strong>${employeeName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Great news! <strong>${adminName}</strong> has invited you to join <strong>${companyName || 'the CRM platform'}</strong>. 
                      You'll be able to manage contacts, track leads, and collaborate with your team.
                    </p>
                    
                    <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin: 30px 0;">
                      <p style="margin: 0 0 10px; color: #0369a1; font-size: 14px; font-weight: 600;">What you'll get access to:</p>
                      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        <li>Contact & Lead Management</li>
                        <li>Email Communication Tools</li>
                        <li>Performance Analytics</li>
                        <li>Team Collaboration Features</li>
                      </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                            Accept Invitation & Get Started
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} ${companyName || 'CRM Platform'}. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                      If the button doesn't work, copy and paste this link: <br>
                      <a href="${inviteLink}" style="color: #0ea5e9; word-break: break-all;">${inviteLink}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
Hi ${employeeName},

${adminName} has invited you to join ${companyName || 'the CRM platform'}.

Click the link below to accept your invitation and get started:
${inviteLink}

This invitation link will expire in 7 days.

Best regards,
${companyName || 'CRM Platform'} Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};

/**
 * Send welcome email after employee completes onboarding
 * @param {Object} options - Email options
 */
export const sendWelcomeEmail = async ({ to, employeeName, companyName }) => {
  const transporter = createTransporter();
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  const mailOptions = {
    from: {
      name: companyName || 'CRM Platform',
      address: process.env.SMTP_EMAIL,
    },
    to,
    subject: `🚀 Welcome aboard, ${employeeName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">You're All Set! 🎉</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hi <strong>${employeeName}</strong>,
                    </p>
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Your account has been successfully set up. You're now ready to start managing contacts, tracking leads, and crushing your goals!
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${frontendUrl}/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                            Go to Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send delay notification email to customer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.customerName - Customer name
 * @param {string} options.companyName - Company name
 * @param {string} options.orderId - Order ID
 * @param {string} options.productName - Product name
 * @param {number} options.delayHours - Hours delayed
 * @param {string} options.delayReason - Reason for delay
 * @param {string} options.expectedDeliveryDate - Original expected delivery date
 */
export const sendDelayNotificationEmail = async ({
  to,
  customerName,
  companyName,
  orderId,
  productName,
  delayHours,
  delayReason,
  expectedDeliveryDate,
}) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('⚠️ SMTP not configured, skipping email send');
    return { success: false, reason: 'SMTP not configured' };
  }

  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: 'Delivery Notifications',
      address: process.env.SMTP_EMAIL,
    },
    to,
    subject: `⚠️ Delivery Update - Order ${orderId}: ${productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery Delay Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef3c7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⏰ Delivery Update</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Dear <strong>${customerName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      We want to proactively inform you that your order is experiencing a delay. We sincerely apologize for any inconvenience this may cause.
                    </p>
                    
                    <!-- Order Details Box -->
                    <div style="background-color: #fef3c7; border-radius: 12px; padding: 24px; margin: 24px 0;">
                      <h3 style="margin: 0 0 16px; color: #92400e; font-size: 18px;">📦 Order Details</h3>
                      <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d;"><strong>Order ID:</strong></td>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d;">${orderId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d;"><strong>Product:</strong></td>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d;">${productName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d;"><strong>Expected Date:</strong></td>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d;">${expectedDeliveryDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d;"><strong>Expected Delay:</strong></td>
                          <td style="padding: 8px 0; border-bottom: 1px solid #fcd34d; color: #dc2626; font-weight: bold;">~${delayHours} hours</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;"><strong>Reason:</strong></td>
                          <td style="padding: 8px 0;">${delayReason}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      We are working diligently to get your order to you as soon as possible. Thank you for your patience and understanding.
                    </p>
                    
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      If you have any questions, please don't hesitate to contact our support team.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      This is an automated notification from ${companyName || 'our delivery system'}.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    console.log(`📧 Sending delay notification email to ${to}...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending delay notification email:', error);
    throw error;
  }
};