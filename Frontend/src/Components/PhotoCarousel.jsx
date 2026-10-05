import React, { useRef, useState } from 'react';

const PLACEHOLDER_IMAGE = '/placeholder-food.svg';

/**
 * Swipeable photo strip for phones: native scroll-snap (so it feels like the
 * platform, with momentum and no JS drag handling), dots that follow the
 * scroll position, and dots you can tap. Desktop keeps the thumbnail gallery.
 */
export default function PhotoCarousel({ images = [], alt = '' }) {
  const strip = useRef(null);
  const [index, setIndex] = useState(0);
  const photos = images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  const onScroll = () => {
    const el = strip.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i) => {
    const el = strip.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="relative" role="group" aria-roledescription="carousel" aria-label="Photos">
      <div
        ref={strip}
        onScroll={onScroll}
        tabIndex={0}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-lg border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ borderColor: '#E5E5E5' }}
      >
        {photos.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={i === 0 ? alt : `${alt} - photo ${i + 1}`}
            width="400"
            height="300"
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }
            }}
            className="aspect-[4/3] w-full shrink-0 snap-center object-contain"
          />
        ))}
      </div>

      {photos.length > 1 && (
        <div className="mt-2 flex justify-center">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Photo ${i + 1} of ${photos.length}`}
              aria-current={i === index ? 'true' : undefined}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span
                className="block h-2 rounded-full transition-all"
                style={{
                  width: i === index ? '1.25rem' : '0.5rem',
                  backgroundColor: i === index ? 'var(--color-solid)' : '#cbd5d1',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
