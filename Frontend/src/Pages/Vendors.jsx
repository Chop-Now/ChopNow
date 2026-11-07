import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { CheckCircle2, Store } from 'lucide-react';
import SEO from '../Components/SEO';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import api from '../services/api';
import { company } from '../config/company';
import { vendorSteps } from '../config/vendors';
import { usePlatformSettings } from '../context/PlatformSettingsContext';

const EMPTY = {
  businessName: '',
  contactName: '',
  phone: '',
  email: '',
  location: '',
  foodType: '',
  website: '', // honeypot: real people never see or fill this
};

const inputClass =
  'mt-2 h-12 w-full rounded-lg border-2 border-surface-border bg-surface px-4 text-base text-moringa outline-none transition-colors placeholder:text-moringa-muted/70 focus:border-moringa';

const Field = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className="text-sm font-medium text-moringa">
      {label}
    </label>
    {children}
  </div>
);

const VendorInterestForm = () => {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/api/contact/vendor-interest', form, { silent: true });
      setSent(true);
      setForm(EMPTY);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `We could not send your details. Please try again or email ${company.email}.`
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border border-surface-border bg-surface p-8 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-moringa" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-moringa">Thank you, we have your details</h3>
        <p className="max-w-md text-sm text-moringa-muted">
          We will contact you by phone or email about the next steps. If you would rather not wait,
          you can also create a vendor account yourself and apply for verification straight away.
        </p>
        <Link
          to="/signup"
          className="mt-2 inline-flex min-h-11 items-center rounded-full bg-moringa px-6 text-sm font-semibold text-fufu transition-all hover:bg-moringa-dark active:scale-95"
        >
          Create a vendor account
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="relative grid grid-cols-1 gap-5 rounded-2xl border border-surface-border bg-surface p-5 shadow-sm sm:grid-cols-2 md:p-8"
    >
      <Field id="vi-business" label="Business name">
        <input
          id="vi-business"
          className={inputClass}
          value={form.businessName}
          onChange={update('businessName')}
          maxLength={120}
          autoComplete="organization"
          required
        />
      </Field>
      <Field id="vi-contact" label="Contact person">
        <input
          id="vi-contact"
          className={inputClass}
          value={form.contactName}
          onChange={update('contactName')}
          maxLength={100}
          autoComplete="name"
          required
        />
      </Field>
      <Field id="vi-phone" label="Phone number">
        <input
          id="vi-phone"
          className={inputClass}
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={update('phone')}
          maxLength={30}
          placeholder="+250 …"
          autoComplete="tel"
          required
        />
      </Field>
      <Field id="vi-email" label="Email">
        <input
          id="vi-email"
          className={inputClass}
          type="email"
          value={form.email}
          onChange={update('email')}
          maxLength={200}
          autoComplete="email"
          required
        />
      </Field>
      <Field id="vi-location" label="Location">
        <input
          id="vi-location"
          className={inputClass}
          value={form.location}
          onChange={update('location')}
          maxLength={200}
          placeholder="Neighbourhood, city"
          autoComplete="off"
          required
        />
      </Field>
      <Field id="vi-food" label="Type of food">
        <input
          id="vi-food"
          className={inputClass}
          value={form.foodType}
          onChange={update('foodType')}
          maxLength={120}
          placeholder="e.g. bread and pastries, cooked meals"
          autoComplete="off"
          required
        />
      </Field>

      {/* Honeypot: hidden from people and screen readers, bots fill it in */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="vi-website">Leave this empty</label>
        <input
          id="vi-website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={update('website')}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-moringa px-8 text-base font-semibold text-fufu transition-all hover:bg-moringa-dark active:scale-[0.99] disabled:opacity-60 sm:w-auto"
        >
          {sending ? 'Sending…' : 'Send my details'}
        </button>
        <p className="mt-3 text-xs text-moringa-muted">
          We only use these details to contact you about selling on ChopNow. See our{' '}
          <Link to="/privacy-policy" className="underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
};

const Vendors = () => {
  const { settings } = usePlatformSettings();
  const { hash } = useLocation();
  const fee = Number(settings.platformFeePercent ?? 10);
  const keep = Math.round((100 - fee) * 100) / 100;

  // Links like /vendors#vendor-form should land on the form.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(
      () => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }),
      150
    );
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="bg-scaffold min-h-screen">
      <SEO
        title="Sell your surplus food"
        description="List your surplus food on ChopNow. Customers in Kigali order at a discount and collect it from you, so good food becomes income instead of waste."
        url="https://www.chopnow.app/vendors"
      />
      <Header />

      {/* Intro */}
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-28 text-center md:pt-36">
        <span className="inline-flex items-center gap-2 rounded-full bg-moringa/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-moringa">
          <Store size={14} aria-hidden="true" /> For vendors
        </span>
        <h1 className="mt-5 text-3xl font-semibold text-moringa md:text-5xl">
          Turn the food you cannot sell today into income
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-moringa-muted md:text-lg">
          ChopNow is a food rescue marketplace. Restaurants, bakeries, shops and caterers list the
          good food they have left at the end of the day. Customers nearby buy it at a discount and
          collect it, so the food gets eaten instead of thrown away.
        </p>
        <a
          href="#vendor-form"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-moringa px-8 text-base font-semibold text-fufu shadow-[5px_5px_0px_0px_rgba(15,61,46,0.35)] transition-all hover:bg-moringa-dark active:scale-95"
        >
          Sign up as a vendor
        </a>
      </section>

      {/* Three steps */}
      <section className="bg-fufu py-12 md:py-16" aria-labelledby="vendor-steps">
        <div className="mx-auto max-w-5xl px-5">
          <h2
            id="vendor-steps"
            className="text-center text-2xl font-semibold text-moringa md:text-3xl"
          >
            How it works for you
          </h2>
          <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {vendorSteps.map((step) => (
              <li key={step.id} className="rounded-2xl bg-surface p-6 shadow-md md:p-7">
                <p className="text-4xl font-extrabold text-moringa/15">{step.id}</p>
                <h3 className="mt-2 text-lg font-bold text-moringa">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-moringa-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-5 py-12 md:py-16" aria-labelledby="vendor-pricing">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-surface p-6 shadow-md md:p-8">
            <h2 id="vendor-pricing" className="text-2xl font-semibold text-moringa">
              What it costs
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-moringa-muted md:text-base">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moringa" aria-hidden="true" />
                <span>
                  <strong className="text-moringa">Free to join and list.</strong> You pay nothing
                  until you make a sale.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moringa" aria-hidden="true" />
                <span>
                  <strong className="text-moringa">ChopNow keeps {fee}% of the food price</strong>{' '}
                  on each completed order. You keep the other {keep}%.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moringa" aria-hidden="true" />
                <span>
                  <strong className="text-moringa">You set your own prices.</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moringa" aria-hidden="true" />
                <span>
                  If a customer chooses delivery, they pay the delivery fee on top. It never comes
                  out of your earnings.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-md md:p-8">
            <h2 className="text-2xl font-semibold text-moringa">Before your listings go live</h2>
            <p className="mt-4 text-sm text-moringa-muted md:text-base">
              Customers need to trust the food they buy, so we check every vendor first. You will
              need:
            </p>
            <ul className="mt-3 space-y-3 text-sm text-moringa-muted md:text-base">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moringa" aria-hidden="true" />
                One business document (for example a licence or registration)
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moringa" aria-hidden="true" />
                Your shop location in Rwanda
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moringa" aria-hidden="true" />
                A Rwandan mobile number
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Form */}
      <section
        id="vendor-form"
        className="scroll-mt-24 bg-fufu py-12 md:py-16"
        aria-labelledby="vendor-form-title"
      >
        <div className="mx-auto max-w-3xl px-5">
          <h2
            id="vendor-form-title"
            className="text-center text-2xl font-semibold text-moringa md:text-3xl"
          >
            Sign up as a vendor
          </h2>
          <p className="mx-auto mb-8 mt-3 max-w-xl text-center text-sm text-moringa-muted md:text-base">
            Tell us a little about your business and we will get in touch. Prefer to start straight
            away?{' '}
            <Link to="/signup" className="font-semibold text-moringa underline">
              Create a vendor account
            </Link>
            .
          </p>
          <VendorInterestForm />
          <p className="mt-6 text-center text-sm text-moringa-muted">
            Questions? Email{' '}
            <a href={`mailto:${company.email}`} className="font-semibold text-moringa underline">
              {company.email}
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vendors;
