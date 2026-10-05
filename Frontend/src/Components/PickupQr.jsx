import React, { useEffect, useState } from 'react';

/**
 * The pickup QR, drawn on the device. It used to be fetched from a public QR
 * service, which meant every pickup code was sent to a third party and the
 * pass failed to appear on a weak signal at the pickup counter. The generator is
 * loaded on demand so it stays out of the main bundle.
 */
export default function PickupQr({ code, className = '' }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    if (!code) return undefined;
    import('qrcode')
      .then((QRCode) =>
        (QRCode.default || QRCode).toDataURL(String(code), { width: 360, margin: 1 })
      )
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!src) {
    return (
      <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} aria-hidden="true" />
    );
  }
  return <img src={src} alt={`Pickup QR code for ${code}`} className={className} />;
}
