import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

/**
 * Where ChopNow is heading with AI. Deliberately plain: both ideas are planned, neither is live,
 * and the section says so. Do not describe it as shipped until it is.
 */
const Innovation = () => (
  <section id="innovation" className="px-5 py-14 md:py-16" aria-labelledby="innovation-title">
    <motion.div
      className="mx-auto max-w-3xl rounded-3xl border border-surface-border bg-surface p-6 text-center shadow-md md:p-10"
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-yellow/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-moringa">
        <Sparkles size={14} aria-hidden="true" /> Planned, not live yet
      </span>
      <h2 id="innovation-title" className="mt-4 text-3xl font-semibold text-moringa md:text-4xl">
        Innovation
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-moringa-muted md:text-base">
        We are planning to use AI to make ChopNow more useful for both sides of the marketplace. For
        customers, personalised meal recommendations would show the deals most likely to suit them.
        For vendors, surplus forecasting would help estimate how much food is likely to be left
        over, so they can plan what to list. These features are not live yet; today ChopNow works
        without them.
      </p>
    </motion.div>
  </section>
);

export default Innovation;
