// Email service utility functions
import { apiUrl } from "./apiBase";

const CRED = { credentials: "include" };

// Email templates
export const emailTemplates = {
  newPostNotification: (post, subscriber) => ({
    subject: `New ${post.category} Results - ${post.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lottery Results</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #004990; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .post-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .post-meta { color: #666; margin-bottom: 15px; }
          .winning-numbers { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .number { display: inline-block; background: #004990; color: white; padding: 8px 12px; margin: 2px; border-radius: 50%; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .cta-button { display: inline-block; background: #004990; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎰 Lottery Results Hub</h1>
          </div>
          <div class="content">
            <h2 class="post-title">${post.title}</h2>
            <div class="post-meta">
              <strong>Category:</strong> ${post.category}<br>
              <strong>Draw Date:</strong> ${new Date(post.drawDate).toLocaleDateString()}<br>
              <strong>Jackpot:</strong> ${post.jackpot || 'TBD'}
            </div>
            
            ${post.winningNumbers ? `
              <div class="winning-numbers">
                <h3>Winning Numbers:</h3>
                <p>${post.winningNumbers}</p>
              </div>
            ` : ''}
            
            ${post.description ? `
              <p>${post.description}</p>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com'}/${post.category.toLowerCase().replace(/\s+/g, '-')}/${post.slug || post.id}" class="cta-button">
                View Full Results
              </a>
            </div>
          </div>
          <div class="footer">
            <p>You received this email because you subscribed to lottery results updates.</p>
            <p><a href="${process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com'}/unsubscribe?token=${subscriber.unsubscribeToken}">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New ${post.category} Results - ${post.title}
      
      Category: ${post.category}
      Draw Date: ${new Date(post.drawDate).toLocaleDateString()}
      Jackpot: ${post.jackpot || 'TBD'}
      
      ${post.winningNumbers ? `Winning Numbers: ${post.winningNumbers}` : ''}
      
      ${post.description || ''}
      
      View full results: ${process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com'}/${post.category.toLowerCase().replace(/\s+/g, '-')}/${post.slug || post.id}
      
      You received this email because you subscribed to lottery results updates.
      Unsubscribe: ${process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com'}/unsubscribe?token=${subscriber.unsubscribeToken}
    `
  }),

  welcomeEmail: (subscriber) => ({
    subject: 'Welcome to Lottery Results Hub!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Lottery Results Hub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #004990; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎰 Welcome to Lottery Results Hub!</h1>
          </div>
          <div class="content">
            <p>Thank you for subscribing to our lottery results newsletter!</p>
            <p>You'll now receive email notifications whenever we publish new lottery results, including:</p>
            <ul>
              <li>Powerball results</li>
              <li>Mega Millions results</li>
              <li>Lotto results</li>
              <li>Take 5 results</li>
              <li>Pick 10 results</li>
              <li>Quick Draw results</li>
            </ul>
            <p>Stay tuned for the latest winning numbers and jackpot information!</p>
          </div>
          <div class="footer">
            <p>You can unsubscribe at any time by clicking the link in any email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Lottery Results Hub!
      
      Thank you for subscribing to our lottery results newsletter!
      
      You'll now receive email notifications whenever we publish new lottery results, including:
      - Powerball results
      - Mega Millions results
      - Lotto results
      - Take 5 results
      - Pick 10 results
      - Quick Draw results
      
      Stay tuned for the latest winning numbers and jackpot information!
      
      You can unsubscribe at any time by clicking the link in any email.
    `
  }),

  unsubscribeConfirmation: (subscriber) => ({
    subject: 'You have been unsubscribed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #004990; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎰 Lottery Results Hub</h1>
          </div>
          <div class="content">
            <p>You have been successfully unsubscribed from our lottery results newsletter.</p>
            <p>We're sorry to see you go! If you change your mind, you can always resubscribe on our website.</p>
            <p>Thank you for being a part of our community.</p>
          </div>
          <div class="footer">
            <p>Lottery Results Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      You have been successfully unsubscribed from our lottery results newsletter.
      
      We're sorry to see you go! If you change your mind, you can always resubscribe on our website.
      
      Thank you for being a part of our community.
      
      Lottery Results Hub
    `
  })
};

// Send email notification to subscribers
export const sendPostNotification = async (post, subscribers) => {
  try {
    const response = await fetch(apiUrl("/admin/email/send-post-notification"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post,
        subscribers: subscribers.map(sub => ({
          email: sub.email,
          unsubscribeToken: sub.unsubscribeToken
        }))
      }),
      ...CRED,
    });

    if (!response.ok) {
      throw new Error('Failed to send post notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending post notification:', error);
    throw error;
  }
};

// Send welcome email to new subscriber
export const sendWelcomeEmail = async (subscriber) => {
  try {
    const response = await fetch(apiUrl("/admin/email/send-welcome"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriber }),
      ...CRED,
    });

    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send unsubscribe confirmation
export const sendUnsubscribeConfirmation = async (subscriber) => {
  try {
    const response = await fetch(apiUrl("/admin/email/send-unsubscribe-confirmation"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriber }),
      ...CRED,
    });

    if (!response.ok) {
      throw new Error('Failed to send unsubscribe confirmation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending unsubscribe confirmation:', error);
    throw error;
  }
};

// Get email service status
export const getEmailServiceStatus = async () => {
  try {
    const response = await fetch(apiUrl("/admin/email/status"), CRED);
    if (!response.ok) {
      throw new Error('Failed to get email service status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting email service status:', error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const response = await fetch(apiUrl("/admin/email/test"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...CRED,
    });
    if (!response.ok) {
      throw new Error('Failed to test email configuration');
    }
    return await response.json();
  } catch (error) {
    console.error('Error testing email configuration:', error);
    throw error;
  }
};

// Get email statistics
export const getEmailStatistics = async (period = "30d") => {
  try {
    const response = await fetch(apiUrl(`/admin/email/statistics?period=${period}`), CRED);
    if (!response.ok) {
      throw new Error('Failed to get email statistics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting email statistics:', error);
    throw error;
  }
};

// Validate email address
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate unsubscribe token
export const generateUnsubscribeToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Format email for display
export const formatEmailForDisplay = (email) => {
  const [localPart, domain] = email.split('@');
  if (localPart.length > 3) {
    return `${localPart.substring(0, 3)}***@${domain}`;
  }
  return `***@${domain}`;
};

export default {
  emailTemplates,
  sendPostNotification,
  sendWelcomeEmail,
  sendUnsubscribeConfirmation,
  getEmailServiceStatus,
  testEmailConfiguration,
  getEmailStatistics,
  validateEmail,
  generateUnsubscribeToken,
  formatEmailForDisplay
};

