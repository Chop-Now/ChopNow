import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import browse from '../assets/screens/screen-browse.webp';
import listing from '../assets/screens/screen-listing.webp';
import checkout from '../assets/screens/screen-checkout.webp';
import pickup from '../assets/screens/screen-pickup.webp';

// Real screenshots of the ChopNow web app on a phone. They were taken with sample listings and
// sample vendors (clearly named "Sample ..."), because the shop is being filled by real vendors.
const screens = [
  {
    src: browse,
    alt: 'ChopNow shop on a phone: discounted meals from nearby vendors with prices and a discount badge',
    title: 'Browse discounted meals',
    caption: 'See surplus food near you, with the saving shown on every card.',
  },
  {
    src: listing,
    alt: 'A ChopNow vendor listing with photo, price, original price and stock left',
    title: 'Open a vendor listing',
    caption: 'Check the photo, the price and how many portions are left.',
  },
  {
    src: checkout,
    alt: 'ChopNow checkout with the vendor address and MTN Mobile Money or Airtel Money payment',
    title: 'Order and pay',
    caption: 'Pay with MTN Mobile Money or Airtel Money.',
  },
  {
    src: pickup,
    alt: 'A ChopNow pickup pass showing a QR code and pickup code for the vendor',
    title: 'Pick up with your code',
    caption: 'Show the QR code or pickup code at the shop and collect your food.',
  },
];

const AppShowcase = () => (
  <section id="seeItInAction" className="px-4 py-14 md:py-16" aria-labelledby="in-action">
    <motion.div
      className="mx-auto max-w-2xl text-center"
      initial={{ y: -20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 id="in-action" className="text-3xl font-semibold text-moringa md:text-4xl">
        See ChopNow in action
      </h2>
      <p className="mt-3 text-sm text-moringa-muted md:text-base">
        From finding a deal to collecting it at the shop, in four steps.
      </p>
    </motion.div>

    {/* Swipe sideways on a phone, four across on a larger screen */}
    <div
      role="region"
      aria-label="ChopNow app screenshots"
      tabIndex={0}
      className="mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-moringa md:grid md:grid-cols-4 md:gap-8 md:overflow-visible md:pb-0"
    >
      {screens.map((screen, index) => (
        <motion.figure
          key={screen.title}
          className="w-[68vw] max-w-[260px] shrink-0 snap-center md:w-auto md:max-w-none"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="mx-auto overflow-hidden rounded-[2rem] border-[6px] border-char bg-surface shadow-xl md:max-w-[250px]">
            <img
              src={screen.src}
              alt={screen.alt}
              width="390"
              height="844"
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </div>
          <figcaption className="mx-auto mt-4 text-center md:max-w-[250px]">
            <p className="font-semibold text-moringa">{screen.title}</p>
            <p className="mt-1 text-sm text-moringa-muted">{screen.caption}</p>
          </figcaption>
        </motion.figure>
      ))}
    </div>

    <p className="mt-6 text-center text-xs text-moringa-muted">
      Screenshots show sample listings and sample vendors.
    </p>
  </section>
);

export default AppShowcase;
