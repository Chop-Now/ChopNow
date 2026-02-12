import React, { useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";

const AboutUs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const sections = [
    {
      image: "https://images.unsplash.com/photo-1719368472026-dc26f70a9b76?q=80&h=800&w=800&auto=format&fit=crop",
      title: "Our Mission",
      description: "Transforming food surplus into community support across Africa."
    },
    {
      image: "https://images.unsplash.com/photo-1649265825072-f7dd6942baed?q=80&h=800&w=800&auto=format&fit=crop",
      title: "Our Vision",
      description: "A hunger-free Africa where no food goes to waste."
    },
    {
      image: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&h=800&w=800&auto=format&fit=crop",
      title: "Community First",
      description: "Connecting vendors, consumers, and NGOs for maximum impact."
    },
    {
      image: "https://images.unsplash.com/photo-1729086046027-09979ade13fd?q=80&h=800&w=800&auto=format&fit=crop",
      title: "Sustainability",
      description: "Reducing food waste while fighting hunger and protecting our planet."
    },
    {
      image: "https://images.unsplash.com/photo-1601568494843-772eb04aca5d?q=80&h=800&w=800&auto=format&fit=crop",
      title: "Innovation",
      description: "Real-time technology connecting surplus food with those who need it."
    },
    {
      image: "https://images.unsplash.com/photo-1585687501004-615dfdfde7f1?q=80&h=800&w=800&auto=format&fit=crop",
      title: "Our Impact",
      description: "Building a circular food economy across African cities."
    }
  ];

  return (
    <div id='AboutUs' className="px-4 py-12 md:py-16">
      <motion.h1 
        className="text-3xl md:text-4xl font-semibold text-center mx-auto" 
        style={{ color: 'var(--color-textColor)' }}
        initial={{ y: -30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        About Us
      </motion.h1>
      <motion.p 
        className="text-sm md:text-base text-center mt-2 max-w-lg mx-auto" 
        style={{ color: 'var(--color-gray-50)' }}
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        Our origin, our purpose, our vision. This is our story.
      </motion.p>
      
      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-2 h-[400px] w-full max-w-4xl mt-10 mx-auto">
        {sections.map((section, index) => (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }} 
            key={index}
            className="relative group grow transition-all w-56 rounded-lg overflow-hidden h-[400px] duration-500 hover:w-full cursor-pointer"
            onMouseEnter={() => setActiveIndex(index)}
          >
            <img 
              className="h-full w-full object-cover object-center"
              src={section.image}
              alt={section.title} 
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <h3 className="text-white font-bold text-lg mb-2 opacity-100 group-hover:opacity-100 transition-opacity">
                {section.title}
              </h3>
              <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {section.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden mt-10 max-w-md mx-auto">
        <motion.div 
          className="relative rounded-lg overflow-hidden h-[400px]"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -10000) {
              // Swiped left - go to next
              setActiveIndex((prev) => (prev + 1) % sections.length);
            } else if (swipe > 10000) {
              // Swiped right - go to previous
              setActiveIndex((prev) => (prev - 1 + sections.length) % sections.length);
            }
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <img 
            className="h-full w-full object-cover object-center"
            src={sections[activeIndex].image}
            alt={sections[activeIndex].title} 
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-white font-bold text-2xl mb-4">
              {sections[activeIndex].title}
            </h3>
            <p className="text-white text-base">
              {sections[activeIndex].description}
            </p>
          </div>
        </motion.div>
        
        {/* Navigation Dots */ }
        <motion.div 
          className="flex justify-center gap-2 mt-6"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: activeIndex === index ? 'var(--color-solid)' : 'var(--color-gray-50)',
                opacity: activeIndex === index ? 1 : 0.5
              }}
              aria-label={`View section ${index + 1}`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default AboutUs
