import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

/**
 * Scans the customer's pickup QR with the phone camera and hands the code back.
 * Uses the browser's native BarcodeDetector where it exists (Chrome/Android) and
 * the jsQR decoder everywhere else (iOS Safari). The camera is only opened when
 * the vendor taps Scan, and is always released on close.
 */
export default function PickupScanner({ onCode, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream;
    let stopped = false;
    let timer = 0;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser cannot open the camera. Type the code instead.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        setError('Camera access was blocked. Allow it in your browser settings, or type the code.');
        return;
      }
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play().catch(() => {});

      const detector =
        'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const jsQR = detector ? null : (await import('jsqr')).default;

      const tick = async () => {
        if (stopped) return;
        if (video.readyState >= 2 && video.videoWidth) {
          let value = '';
          try {
            if (detector) {
              const found = await detector.detect(video);
              value = found[0]?.rawValue || '';
            } else {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);
              const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
              value = jsQR(image.data, image.width, image.height)?.data || '';
            }
          } catch {
            /* keep scanning */
          }
          if (value) {
            onCode(value);
            return;
          }
        }
        timer = window.setTimeout(tick, 200);
      };
      tick();
    };

    start();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onCode]);

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} playsInline muted className="aspect-square w-full object-cover" />
        <div
          className="pointer-events-none absolute inset-8 rounded-lg border-2 border-white/80"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close scanner"
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <p className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Point the camera at the customer&apos;s QR code
        </p>
      )}
    </div>
  );
}
