const { sendContactMessage, sendVendorInterest } = require('../utils/emailService');
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

// Vendor sign-up interest goes to the founder's mailbox (override with VENDOR_INTEREST_INBOX).
const VENDOR_INBOX = () => process.env.VENDOR_INTEREST_INBOX || 'chibueze@chopnow.app';

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max + 1) : '');

/**
 * @desc    A food business tells us it wants to sell on ChopNow (public /vendors form)
 * @route   POST /api/contact/vendor-interest
 * @access  Public (rate limited)
 */
const sendVendorInterestForm = async (req, res) => {
  // A hidden field real visitors never fill in; bots do. Pretend it worked, send nothing.
  if (typeof req.body?.website === 'string' && req.body.website.trim()) {
    return res.status(202).json({ message: 'Thanks, we have your details.' });
  }
  const form = {
    businessName: text(req.body?.businessName, 120),
    contactName: text(req.body?.contactName, 100),
    phone: text(req.body?.phone, 30),
    email: text(req.body?.email, 200),
    location: text(req.body?.location, 200),
    foodType: text(req.body?.foodType, 120),
    message: text(req.body?.message, 1000),
  };

  if (form.businessName.length < 2 || form.businessName.length > 120) {
    return res.status(400).json({ message: 'Please enter your business name' });
  }
  if (form.contactName.length < 2 || form.contactName.length > 100) {
    return res.status(400).json({ message: 'Please enter the contact person’s name' });
  }
  const digits = form.phone.replace(/\D/g, '');
  if (!/^[0-9+()\-\s]+$/.test(form.phone) || digits.length < 9 || digits.length > 15) {
    return res.status(400).json({ message: 'Please enter a valid phone number' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.email.length > 200) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  if (form.location.length < 3 || form.location.length > 200) {
    return res.status(400).json({ message: 'Please tell us where your business is' });
  }
  if (form.foodType.length < 2 || form.foodType.length > 120) {
    return res.status(400).json({ message: 'Please tell us what kind of food you sell' });
  }
  if (form.message.length > 1000) {
    return res.status(400).json({ message: 'Please keep your note under 1000 characters' });
  }

  try {
    const sent = await sendVendorInterest(VENDOR_INBOX(), form);
    if (!sent) {
      logger.error('Vendor interest form could not be delivered by the mail provider');
      return res.status(503).json({
        message: `We could not send your details right now. Please email ${VENDOR_INBOX()} instead.`,
      });
    }
    return res.status(202).json({ message: 'Thanks, we have your details and will be in touch.' });
  } catch (error) {
    logger.error({ err: error }, 'Vendor interest form failed');
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

module.exports = { sendContact, sendVendorInterestForm };
