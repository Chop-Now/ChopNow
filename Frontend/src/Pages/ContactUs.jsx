import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.message.trim().length < 10) {
      toast.error('Please write a little more (at least 10 characters)');
      return;
    }
    setSending(true);
    try {
      await api.post('/api/contact', form, { silent: true });
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(
        error.response?.data?.errors?.[0]?.msg ||
          error.response?.data?.message ||
          'We could not send your message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
            .button-wrapper::before {
                animation: spin-gradient 4s linear infinite;
            }
        
            @keyframes spin-gradient {
                from {
                    transform: rotate(0deg);
                }
        
                to {
                    transform: rotate(360deg);
                }
            }
        `}</style>
      <div className="min-h-screen w-full bg-white px-6 md:px-16 lg:px-24 xl:px-32 py-12">
        {/* Back button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative inline-block p-0.5 rounded-full overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,#0F3D2E,#0F3D2E30,#E8552F,#E8552F30,#0F3D2E)] button-wrapper">
            <motion.button
              onClick={() => navigate(-1)}
              className="relative z-10 rounded-full px-6 py-2.5 font-medium text-sm flex items-center gap-2 cursor-pointer text-white"
              style={{ backgroundColor: 'var(--color-solid)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <ArrowLeft size={18} />
              Back
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 mt-2">
            Get in touch with us
          </h1>
          <p className="text-sm text-slate-500 text-center mt-4 max-w-xl">
            Have questions about ChopNow? We'd love to hear from you.
            <br />
            Send us a message and we'll respond as soon as possible.
          </p>

          {/* Contact Info */}
          <motion.div
            className="flex flex-col md:flex-row items-center gap-6 mt-8 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={18} style={{ color: 'var(--color-solid)' }} />
              <span>Kigali, Rwanda</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={18} style={{ color: 'var(--color-solid)' }} />
              <span>chopnow.app@gmail.com</span>
            </div>
          </motion.div>
        </motion.div>

        {sent && (
          <div
            role="status"
            className="max-w-3xl mx-auto mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800"
          >
            Thanks, your message has been sent. We will reply to your email address as soon as we
            can.
          </div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col items-center text-sm max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-start gap-6 w-full">
            <div className="w-full">
              <label className="text-slate-700 font-medium" htmlFor="name">
                Your Name
              </label>
              <div className="relative mt-2">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  className="h-12 pl-10 pr-4 w-full border-2 border-gray-200 rounded-lg outline-none transition-all duration-200 focus:border-(--color-solid)"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={update('name')}
                  maxLength={100}
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </div>
            </div>
            <div className="w-full">
              <label className="text-slate-700 font-medium" htmlFor="email">
                Your Email
              </label>
              <div className="relative mt-2">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  className="h-12 pl-10 pr-4 w-full border-2 border-gray-200 rounded-lg outline-none transition-all duration-200 focus:border-(--color-solid)"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={update('email')}
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 w-full">
            <label className="text-slate-700 font-medium" htmlFor="message">
              Message
            </label>
            <textarea
              className="w-full mt-2 p-4 h-40 border-2 border-gray-200 rounded-lg resize-none outline-none transition-all duration-200 focus:border-(--color-solid)"
              id="message"
              name="message"
              value={form.message}
              onChange={update('message')}
              maxLength={2000}
              placeholder="Tell us how we can help you..."
              required
            ></textarea>
          </div>

          <motion.button
            type="submit"
            disabled={sending}
            className="mt-8 disabled:opacity-60 text-white h-12 px-8 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'var(--color-solid)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {sending ? 'Sending…' : 'Send Message'}
          </motion.button>
        </motion.form>
      </div>
    </>
  );
};

export default ContactUs;
