import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageNavbar from '../Components/PageNavbar';
import SEO from '../Components/SEO';
import { favoriteService } from '../services';
import { getCategoryDisplay } from '../utils/transforms';

const rwf = (n) => `RWF ${Math.round(n || 0).toLocaleString()}`;

/** Deals the buyer has saved with the heart on a product page. */
const Favorites = () => {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let mounted = true;
    favoriteService
      .getFavorites('listing')
      .then((data) => {
        if (!mounted) return;
        // A listing can be deleted after it was saved; skip those.
        setItems((data.favorites || []).filter((f) => f.listing));
      })
      .catch(() => mounted && setError(true));
    return () => {
      mounted = false;
    };
  }, []);

  const remove = async (listingId) => {
    setBusyId(listingId);
    try {
      await favoriteService.toggleFavorite('listing', listingId);
      setItems((prev) => prev.filter((f) => f.listing._id !== listingId));
      toast.success('Removed from saved deals');
    } catch {
      toast.error('Could not remove it. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const unavailable = (listing) =>
    listing.status !== 'active' || (listing.inventory?.quantity ?? 0) <= 0;

  return (
    <div className="bg-white min-h-screen pt-20">
      <SEO title="Saved deals" description="Deals you have saved on ChopNow." />
      <PageNavbar />
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
        <h1 className="mb-1 text-2xl font-bold" style={{ color: 'var(--color-textColor)' }}>
          Saved deals
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-moringa-muted)' }}>
          Deals you tapped the heart on. Surplus sells fast, so grab them while they last.
        </p>

        {error ? (
          <p role="alert" className="py-10 text-center text-sm">
            We could not load your saved deals. Please try again in a moment.
          </p>
        ) : items === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Heart
              className="mx-auto mb-3 h-10 w-10"
              style={{ color: 'var(--color-moringa-muted)' }}
            />
            <p className="mb-4 text-base font-medium">Nothing saved yet</p>
            <Link
              to="/shop"
              className="inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--color-solid)' }}
            >
              Browse deals
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3">
            {items.map(({ _id, listing }) => (
              <li
                key={_id}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{ borderColor: '#E5E5E5' }}
              >
                <Link
                  to={`/shop/${listing.category}/${listing._id}`}
                  className="min-w-0 flex-1"
                  aria-label={`${listing.title}, ${rwf(listing.pricing?.price)}`}
                >
                  <p className="truncate text-base font-semibold">{listing.title}</p>
                  <p className="truncate text-sm" style={{ color: 'var(--color-moringa-muted)' }}>
                    {listing.business?.name || 'Local vendor'} ·{' '}
                    {getCategoryDisplay(listing.category)}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-bold">{rwf(listing.pricing?.price)}</span>
                    {listing.pricing?.originalPrice > listing.pricing?.price && (
                      <span className="ml-2 text-xs line-through opacity-60">
                        {rwf(listing.pricing.originalPrice)}
                      </span>
                    )}
                    {unavailable(listing) && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                        No longer available
                      </span>
                    )}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => remove(listing._id)}
                  disabled={busyId === listing._id}
                  aria-label={`Remove ${listing.title} from saved deals`}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full disabled:opacity-50"
                >
                  <Heart
                    className="h-5 w-5"
                    fill="var(--color-solidOne)"
                    style={{ color: 'var(--color-solidOne)' }}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Favorites;
