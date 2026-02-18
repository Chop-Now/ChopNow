import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';

const Footer = () => {
  const linkSections = [
    {
      title: 'Quick Links',
      links: ['Contact Us', 'FAQs', 'Privacy Policy'],
    },
    {
      title: 'Need Help?',
      links: ['Delivery Information', 'Return & Refund Policy', 'Terms & Conditions'],
    },
  ];
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 text-gray-500">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img className="h-10 md:h-12" src={assets.ChopNowLogo} alt="ChopNow Logo" />
          <p className="max-w-[410px] mt-6">
            Fueling Africa's food security by rescuing meals, fighting waste, and empowering
            communities.
          </p>
        </motion.div>
        <div className="flex flex-wrap justify-between w-full md:w-[60%] gap-8">
          {linkSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
                {section.title}
              </h3>
              <ul className="text-sm space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    {link === 'FAQs' ? (
                      <Link to="/faq" className="hover:underline transition">
                        {link}
                      </Link>
                    ) : link === 'Contact Us' ? (
                      <Link to="/contact-us" className="hover:underline transition">
                        {link}
                      </Link>
                    ) : link === 'Privacy Policy' ? (
                      <Link to="/privacy-policy" className="hover:underline transition">
                        {link}
                      </Link>
                    ) : link === 'Terms & Conditions' ? (
                      <Link to="/terms-of-service" className="hover:underline transition">
                        {link}
                      </Link>
                    ) : (
                      <a href="#" className="hover:underline transition">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          <motion.div
            className="max-w-xs text-center md:text-left w-full mx-auto md:mx-0"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
              Stay updated with ChopNow
            </h3>
            <p className="text-sm mb-4">
              Join our newsletter and be the first to discover new updates, exclusive offers, and
              inspiration.
            </p>
            <div className="flex items-center border border-gray-400 focus-within:border-(--color-solid) focus-within:ring-2 focus-within:ring-solid/20 text-sm rounded-full h-12 w-full transition-all mx-auto md:mx-0">
              <input
                type="email"
                className="bg-transparent outline-none rounded-full px-4 h-full flex-1 text-gray-700 placeholder:text-gray-400"
                placeholder="Enter your email"
              />
              <button
                className="text-white rounded-full h-9 mr-1.5 px-6 flex items-center justify-center text-xs font-medium transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--color-solid)' }}
              >
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <motion.div
        className="flex flex-col items-center pb-8 border-b border-gray-500/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-gray-600 font-medium mb-4">We accept</p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* MTN Momo */}
          <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center p-2 hover:border-(--color-solid) transition-colors">
            <img
              src={assets.momo}
              alt="MTN Mobile Money"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Airtel Money */}
          <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center p-2 hover:border-(--color-solid) transition-colors">
            <img
              src={assets.airtel_money}
              alt="Airtel Money"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Bank */}
          <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center p-2 hover:border-(--color-solid) transition-colors">
            <img src={assets.bank} alt="Bank Transfer" className="w-full h-full object-contain" />
          </div>

          {/* Mastercard */}
          <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center p-2 hover:border-(--color-solid) transition-colors">
            <img
              src={assets.mastercard}
              alt="Mastercard"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Visa */}
          <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center p-2 hover:border-(--color-solid) transition-colors">
            <img src={assets.visa} alt="Visa" className="w-full h-full object-contain" />
          </div>
        </div>
      </motion.div>

      <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.p
          className="text-sm md:text-base text-gray-500/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Copyright 2026 ©{' '}
          <a href="#" className="hover:underline">
            ChopNow
          </a>{' '}
          All Right Reserved.
        </motion.p>
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a href="#" className="text-gray-500 hover:text-gray-700 transition">
            <Instagram size={20} />
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-700 transition">
            <Twitter size={20} />
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-700 transition">
            <Linkedin size={20} />
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-700 transition">
            <Youtube size={20} />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Footer;
