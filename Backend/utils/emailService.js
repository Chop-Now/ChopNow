const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'ChopNow <noreply@chopnow.app>';
const APP_URL = process.env.FRONTEND_URL || 'https://www.chopnow.app';

/**
 * Send email verification
 */
const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your ChopNow account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ChopNow</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome to ChopNow, ${name}!</h2>
            <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your ChopNow password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ChopNow</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${resetUrl}</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Send OTP for email login
 */
const sendOTPEmail = async (email, name, otpCode) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your ChopNow login code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ChopNow</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Login Code</h2>
            <p>Hello ${name},</p>
            <p>Use this code to sign in to your ChopNow account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: white; border: 2px solid #f97316; border-radius: 8px; padding: 20px; display: inline-block;">
                <div style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px;">${otpCode}</div>
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't request this code, please ignore this email or contact support.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (email, name, order) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ChopNow</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Confirmed!</h2>
            <p>Hello ${name},</p>
            <p>Your order has been confirmed. Here are the details:</p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Total:</strong> ${order.pricing?.currency || 'RWF'} ${order.pricing?.total || 0}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
              ${order.fulfillmentType === 'pickup' && order.pickupDetails?.pickupCode ? 
                `<p style="margin: 5px 0;"><strong>Pickup Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #f97316;">${order.pickupDetails.pickupCode}</span></p>` : ''}
            </div>
            <p style="color: #6b7280; font-size: 14px;">You can track your order in the app.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

/**
 * Send order status update email
 */
const sendOrderStatusUpdateEmail = async (email, name, order, status) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed by the vendor.',
    ready_for_pickup: 'Your order is ready for pickup!',
    out_for_delivery: 'Your order is on the way!',
    completed: 'Your order has been completed. Thank you!',
    cancelled: 'Your order has been cancelled.',
  };

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Order Update - #${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ChopNow</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Update</h2>
            <p>Hello ${name},</p>
            <p>${statusMessages[status] || 'Your order status has been updated.'}</p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="text-transform: capitalize;">${status.replace(/_/g, ' ')}</span></p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">View your order in the app for more details.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return false;
  }
};

/**
 * Send vendor order notification
 */
const sendVendorOrderNotification = async (email, businessName, order) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `New Order - #${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ChopNow</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">New Order Received</h2>
            <p>Hello ${businessName},</p>
            <p>You have received a new order. Please review and confirm it.</p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Total:</strong> ${order.pricing?.currency || 'RWF'} ${order.pricing?.total || 0}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Log in to your vendor dashboard to manage this order.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending vendor order notification:', error);
    return false;
  }
};

/**
 * Send admin notification (vendor approval, etc.)
 */
const sendAdminNotification = async (email, name, subject, message) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: subject || 'ChopNow Admin Notification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ChopNow</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">${subject || 'Notification'}</h2>
            <p>Hello ${name},</p>
            <p>${message}</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendVendorOrderNotification,
  sendAdminNotification,
};
