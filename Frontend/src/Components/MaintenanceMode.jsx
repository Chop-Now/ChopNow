import React from 'react';
import { Wrench, Mail, Phone } from 'lucide-react';
import { usePlatformSettings } from '../context/PlatformSettingsContext';

// Values the admin Settings page shipped with. They were never real contact details, so they
// are never shown to visitors - the real mailbox is used instead and the phone is left out.
const PLACEHOLDER_EMAILS = ['support@chopnow.com'];
const PLACEHOLDER_PHONES = ['+250 788 000 000', '+250788000000'];

const MaintenanceMode = () => {
  const { settings } = usePlatformSettings();
  const email = PLACEHOLDER_EMAILS.includes(settings.supportEmail)
    ? ''
    : settings.supportEmail || '';
  const supportEmail = email || 'chopnow.app@gmail.com';
  const supportPhone = PLACEHOLDER_PHONES.includes(settings.supportPhone)
    ? ''
    : settings.supportPhone || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated wrench icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Wrench className="w-12 h-12 text-yellow-500" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-yellow-500/30 animate-ping" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">{settings.platformName || 'ChopNow'}</h1>

        <h2 className="text-2xl font-semibold text-yellow-500 mb-6">Under Maintenance</h2>

        {/* Message */}
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          We're currently performing scheduled maintenance to improve your experience. We'll be back
          shortly. Thank you for your patience!
        </p>

        {/* Contact Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700">
          <p className="text-slate-400 mb-4">Need urgent assistance? Contact us:</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-2 text-white hover:text-yellow-500 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>{supportEmail}</span>
            </a>

            {supportPhone && (
              <>
                <span className="hidden sm:block text-slate-600">|</span>

                <a
                  href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-white hover:text-yellow-500 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>{supportPhone}</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-slate-500 mt-8 text-sm">
          {settings.platformTagline || 'Save Food, Save Money, Save the Planet'}
        </p>
      </div>
    </div>
  );
};

export default MaintenanceMode;
