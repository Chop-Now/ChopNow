import React from 'react'
import { Link } from 'react-router-dom';
import { AnimatedTestimonials } from "./ui/animated-testimonials";
import { motion } from "motion/react";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "ChopNow has transformed how we manage surplus food. The platform makes it incredibly easy to connect with those in need.",
      name: "Amara Okonkwo",
      designation: "Restaurant Owner, Lagos",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "As a food vendor, ChopNow helps me reduce waste while supporting my community. It's a win-win solution.",
      name: "Kwame Mensah",
      designation: "Market Vendor, Accra",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The real-time notifications ensure we never miss an opportunity to access affordable meals. ChopNow is a lifesaver.",
      name: "Fatima Diallo",
      designation: "Community Leader, Dakar",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Our NGO has been able to feed more families thanks to ChopNow's efficient food redistribution network.",
      name: "Emmanuel Banda",
      designation: "NGO Director, Nairobi",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "ChopNow's impact tracking helps us measure our contribution to reducing food waste and fighting hunger in our region.",
      name: "Aisha Mohammed",
      designation: "Sustainability Officer, Kigali",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div id='testimonials' className="py-12 md:py-16">
      <motion.div 
        className="text-center mb-8 px-4"
        initial={{ y: -30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>
          What People Say About Us
        </h1>
        <p className="max-w-2xl mx-auto text-sm md:text-base" style={{ color: 'var(--color-gray-50)' }}>
          Real stories from vendors, consumers, and partners making a difference with ChopNow.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </motion.div>
      
      {/* CTA Section */}
      <motion.div 
        className="flex flex-col md:flex-row items-center justify-around rounded-2xl mx-6 md:mx-auto max-w-5xl shadow-lg mt-12" 
        style={{ backgroundColor: '#E8F5E9' }}
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div 
          className="flex flex-col text-center md:text-left items-center md:items-start pt-14 md:p-10 px-6"
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="md:text-4xl text-2xl font-bold mb-3" style={{ color: 'var(--color-textColor)' }}>
            Ready to start buying your meals while saving the environment?
          </h2>
          <p className="text-sm md:text-base mb-6" style={{ color: 'var(--color-gray-50)' }}>
            Join thousands of users who trust ChopNow for their meal needs.
          </p>
          <Link 
            to="/login"
            aria-label="getStarted" 
            className="px-7 py-3 text-white rounded-md active:scale-95 transition-all hover:opacity-90 font-medium cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-solid)' }}
          >
            Get started
          </Link>
        </motion.div>
        <motion.img 
          className="max-w-[375px] w-full pt-10 md:p-0" 
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/appDownload/excitedWomenImage.png" 
          alt="Excited person using ChopNow"
          initial={{ x: 30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
      </motion.div>
    </div>
  )
}

export default Testimonials
