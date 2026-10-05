import React, { useCallback, useEffect, useState } from 'react';
import { Star, MessageSquareReply, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewService } from '../../services';

const Stars = ({ rating }) => (
  <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`h-4 w-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
        aria-hidden="true"
      />
    ))}
  </span>
);

/**
 * What customers said about your shop, newest first, with a reply sheet. A
 * reply is public and the customer is notified, so the sheet shows what they
 * wrote while you type.
 */
const Reviews = ({ businessId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await reviewService.getBusinessReviews(businessId);
      setReviews(data.reviews || data || []);
    } catch {
      toast.error('Could not load reviews');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const openReply = (review) => {
    setReplying(review);
    setText(review.businessResponse?.comment || '');
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await reviewService.addBusinessResponse(replying._id, text.trim());
      toast.success('Reply sent');
      setReplying(null);
      await load();
    } catch (error) {
      toast.error(error.message || 'Could not send the reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reviews</h2>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
          Customers can only review orders they have collected. Replies are public.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12" role="status" aria-label="Loading reviews">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 p-8 text-center text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/80 dark:text-slate-400">
          No reviews yet. They appear here once customers rate their collected orders.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review._id}
              className="rounded-2xl border border-slate-200/50 bg-white/80 p-4 dark:border-slate-700/50 dark:bg-slate-900/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                    {[review.customer?.firstName, review.customer?.lastName]
                      .filter(Boolean)
                      .join(' ') || 'Customer'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Stars rating={review.rating} />
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{review.comment}</p>
              )}
              {review.businessResponse?.comment && (
                <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Your reply
                  </p>
                  {review.businessResponse.comment}
                </div>
              )}
              <button
                type="button"
                onClick={() => openReply(review)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                <MessageSquareReply className="h-4 w-4" aria-hidden="true" />
                {review.businessResponse?.comment ? 'Edit reply' : 'Reply'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {replying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={send}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Reply to {replying.customer?.firstName || 'customer'}
            </h3>
            <div className="mt-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <Stars rating={replying.rating} />
              <span className="mt-1 block">{replying.comment || 'No written comment'}</span>
            </div>
            <label
              htmlFor="review-reply"
              className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Your reply
            </label>
            <textarea
              id="review-reply"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
            <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
              {text.length}/500
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setReplying(null)}
                className="flex-1 rounded-lg border border-slate-300 font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="flex-1 rounded-lg bg-green-700 font-semibold text-white disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send reply'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reviews;
