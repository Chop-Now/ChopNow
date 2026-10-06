import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

/**
 * Rwandan numbers are usually written "0788 123 456" or "+250 788 123 456".
 * The phone widget starts with "+250" already filled in, so people ended up with
 * "+250 0788..." (the leading 0 kept) or "+250 250 788..." (country code typed
 * twice), and those got saved as numbers that cannot be dialled. This keeps only
 * the real digits.
 */
export const normalizePhone = (value) => {
  let digits = String(value ?? '').replace(/\D/g, '');
  while (digits.startsWith('250250')) digits = digits.slice(3);
  if (digits.startsWith('2500')) digits = `250${digits.slice(4)}`;
  return digits;
};

const PhoneField = ({ onChange, ...props }) => (
  <PhoneInput
    country="rw"
    disableCountryGuess
    {...props}
    onChange={(value, ...rest) => onChange?.(normalizePhone(value), ...rest)}
  />
);

export default PhoneField;
