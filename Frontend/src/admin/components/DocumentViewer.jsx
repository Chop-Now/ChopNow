import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, X } from 'lucide-react';

const IMAGE_PATTERN = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

export const isImageUrl = (url) =>
  typeof url === 'string' && (IMAGE_PATTERN.test(url) || /\/image\/upload\//.test(url));

/**
 * Full-screen viewer for the photos and scans a vendor or rider uploads (ID,
 * licence, vehicle). On a phone a new browser tab loses the review you are in
 * the middle of; this keeps you on the approval screen. Tap the image to
 * zoom in and drag to look around; the browser's own pinch-zoom works too.
 * Anything that isn't an image (a PDF) opens in its own tab instead.
 */
export default function DocumentViewer({ url, label = 'Document', onClose }) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  if (!url) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-overlay-viewer
      className="fixed inset-0 z-[10001] grid grid-rows-[auto_1fr] bg-black/95"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2 text-white">
        <p className="min-w-0 truncate text-sm font-semibold">{label}</p>
        <div className="flex items-center gap-1">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-white/90 hover:bg-white/10"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Original
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            autoFocus
            className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="min-h-0 overflow-auto" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
        {isImageUrl(url) ? (
          <img
            src={url}
            alt={label}
            onClick={() => setZoomed((z) => !z)}
            className={`mx-auto block ${
              zoomed
                ? 'max-w-none w-[250%] cursor-zoom-out'
                : 'max-h-full max-w-full cursor-zoom-in object-contain'
            }`}
            style={zoomed ? undefined : { height: '100%' }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
            <p className="text-sm">This file can&apos;t be previewed here.</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-900"
            >
              Open file
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
