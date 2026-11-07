import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { vendorSteps } from '../config/vendors';

/** Homepage "For Vendors" band. The full explanation and the sign-up form live on /vendors. */
const VendorSection = () => (
  <section id="forVendors" className="bg-fufu px-5 py-14 md:py-16" aria-labelledby="for-vendors">
    <div className="mx-auto max-w-5xl">
      <motion.div
        className="text-center"
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 id="for-vendors" className="text-3xl font-semibold text-moringa md:text-4xl">
          For Vendors
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-moringa-muted md:text-base">
          Run a restaurant, bakery, shop or catering business? Sell the good food you have left at
          the end of the day instead of throwing it away.
        </p>
      </motion.div>

      <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {vendorSteps.map((step, index) => (
          <motion.li
            key={step.id}
            className="rounded-2xl bg-surface p-5 shadow-md md:p-6"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <p className="text-3xl font-extrabold text-moringa/15">{step.id}</p>
            <h3 className="mt-1 text-lg font-bold text-moringa">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-moringa-muted">{step.description}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/vendors#vendor-form"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-moringa px-8 text-base font-semibold text-fufu shadow-[5px_5px_0px_0px_rgba(15,61,46,0.35)] transition-all hover:bg-moringa-dark active:scale-95 sm:w-auto"
        >
          Sign up as a vendor
        </Link>
        <Link
          to="/vendors"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-moringa/30 px-8 text-base font-semibold text-moringa transition-all hover:bg-moringa/5 active:scale-95 sm:w-auto"
        >
          Learn more and see pricing
        </Link>
      </div>
    </div>
  </section>
);

export default VendorSection;
