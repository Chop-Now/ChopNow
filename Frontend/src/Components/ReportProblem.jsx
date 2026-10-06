import { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { disputeService } from '../services';

// Same choices as the mobile app's "Report an issue" screen.
const REASONS = [
  'Wrong item received',
  'Missing items',
  'Food quality issue',
  'Order never arrived',
  'Overcharged',
  'Other',
];

const MIN_DETAILS = 20;

const RESOLUTION_TEXT = {
  full_refund: 'You will be refunded in full.',
  partial_refund: 'You will receive a partial refund.',
};

// "Something wrong with this order?" - lets a buyer report a problem and shows
// where their report stands once they have.
const ReportProblem = ({ orderId, dispute, onReported }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (dispute?.status === 'resolved') {
    return (
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-800">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">Your report was resolved</p>
          <p>
            {RESOLUTION_TEXT[dispute.resolution?.action] || 'Our team reviewed and closed it.'}
            {dispute.resolution?.comment ? ` ${dispute.resolution.comment}` : ''}
          </p>
        </div>
      </div>
    );
  }

  if (dispute) {
    return (
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">Problem reported</p>
          <p>Our team is looking into it. We will notify you here once it is resolved.</p>
        </div>
      </div>
    );
  }

  const tooShort = description.trim().length < MIN_DETAILS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please choose what went wrong');
      return;
    }
    if (tooShort) {
      toast.error(`Please describe the problem in at least ${MIN_DETAILS} characters`);
      return;
    }
    setSubmitting(true);
    try {
      const created = await disputeService.createDispute({
        order: orderId,
        reason,
        description: description.trim(),
      });
      toast.success('Thanks, we have received your report');
      onReported?.(created);
    } catch (error) {
      toast.error(error.message || 'Could not send your report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-700">Something wrong with this order?</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Report a problem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 p-4">
      <h4 className="mb-1 flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        Report a problem
      </h4>
      <p className="mb-3 text-sm text-gray-600">
        Tell us what happened and our team will look into it.
      </p>
      <label htmlFor={`reason-${orderId}`} className="mb-1 block text-sm font-medium">
        What went wrong?
      </label>
      <select
        id={`reason-${orderId}`}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mb-3 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
      >
        <option value="">Choose a reason</option>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <label htmlFor={`details-${orderId}`} className="mb-1 block text-sm font-medium">
        Details
      </label>
      <textarea
        id={`details-${orderId}`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Describe what happened (at least 20 characters)"
        className="mb-1 w-full rounded-md border border-gray-300 p-2 text-sm"
      />
      <p className="mb-3 text-xs text-gray-600">
        {description.trim().length}/{MIN_DETAILS} characters minimum
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send report'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReportProblem;
