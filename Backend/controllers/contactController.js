const { sendContactMessage } = require('../utils/emailService');
const logger = require('../utils/logger');

// Where Contact-page messages go. Defaults to the support mailbox that is verified with the
// mail provider (the admin-editable "support email" setting is shown to customers, not used here).
const CONTACT_INBOX = () => process.env.CONTACT_INBOX || 'chopnow.app@gmail.com';

/**
 * @desc    Send a message from the public Contact page to the support inbox
 * @route   POST /api/contact
 * @access  Public (rate limited)
 */
const sendContact = async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: 'Please enter your name' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({ message: 'Please write a message of 10 to 2000 characters' });
  }

  try {
    const sent = await sendContactMessage(CONTACT_INBOX(), { name, email, message });
    if (!sent) {
      logger.error('Contact message could not be delivered by the mail provider');
      return res.status(503).json({
        message: `We could not send your message right now. Please email ${CONTACT_INBOX()} instead.`,
      });
    }
    return res.status(202).json({ message: 'Thanks, your message has been sent.' });
  } catch (error) {
    logger.error({ err: error }, 'Contact message failed');
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

module.exports = { sendContact };
