import React from 'react'
import { assets } from '../assets/assets';
import { Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { motion } from "motion/react";


const Footer = () => {
  const linkSections = [
        {
            title: "Quick Links",
            links: ["Home", "Contact Us", "FAQs"]
        },
        {
            title: "Need Help?",
            links: ["Delivery Information", "Return & Refund Policy", "Payment Methods", "Contact Us"]
        }
    ];
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <img className="h-10 md:h-12" src={assets.ChopNowLogo} alt="ChopNow Logo" />
                    <p className="max-w-[410px] mt-6">Fueling Africa's food security by rescuing meals, fighting waste, and empowering communities.</p>
                </motion.div>
                <div className="flex flex-wrap justify-between w-full md:w-[60%] gap-8">
                    {linkSections.map((section, index) => (
                        <motion.div 
                            key={index}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                        >
                            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">{section.title}</h3>
                            <ul className="text-sm space-y-1">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <a href="#" className="hover:underline transition">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                    <motion.div 
                        className="max-w-xs"
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">Stay updated with ChopNow</h3>
                        <p className="text-sm mb-4">Join our newsletter and be the first to discover new updates, exclusive offers, and inspiration.</p>
                        <div className="flex items-center border border-gray-400 focus-within:border-(--color-solid) focus-within:ring-2 focus-within:ring-solid/20 text-sm rounded-full h-12 w-full transition-all">
                            <input 
                                type="email" 
                                className="bg-transparent outline-none rounded-full px-4 h-full flex-1 text-gray-700 placeholder:text-gray-400" 
                                placeholder="Enter your email"
                            />
                            <button className="text-white rounded-full h-9 mr-1.5 px-6 flex items-center justify-center text-xs font-medium transition-all hover:opacity-90 active:scale-95 cursor-pointer" style={{ backgroundColor: 'var(--color-solid)' }}>
                                Subscribe
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <motion.p 
                    className="text-sm md:text-base text-gray-500/80"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Copyright 2025 © <a href="#" className="hover:underline">ChopNow</a> All Right Reserved.
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
                        <Twitter size={20}/>
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
  )
}

export default Footer
