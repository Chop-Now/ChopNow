// A business or delivery address can be a plain string or an object, and new businesses are created
// with the placeholder "To be updated" for street and city until they fill them in. Customers should
// never be shown that placeholder as if it were an address.
const PLACEHOLDER = /^\s*to be updated\s*$/i;

export function formatAddress(address, fallback = 'Address not provided yet') {
  if (!address) return fallback;
  if (typeof address === 'string')
    return PLACEHOLDER.test(address) ? fallback : address.trim() || fallback;
  const parts = [address.text, address.street, address.city, address.country]
    .filter((part) => typeof part === 'string' && part.trim() && !PLACEHOLDER.test(part))
    .map((part) => part.trim());
  // "text" is the full address as typed; street/city only add something when it is missing
  const text = address.text && !PLACEHOLDER.test(address.text) ? address.text.trim() : '';
  return text || [...new Set(parts)].join(', ') || fallback;
}
