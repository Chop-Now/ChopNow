import React from 'react';

/** A thin progress bar for file uploads: on mobile data a KYC upload can take a while. */
export default function UploadProgress({ percent }) {
  if (percent == null) return null;
  return (
    <div className="mt-3" role="status" aria-live="polite">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Upload progress"
      >
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${percent}%`, backgroundColor: 'var(--color-solid)' }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-gray-600">
        {percent < 100 ? `Uploading... ${percent}%` : 'Upload complete, processing...'}
      </p>
    </div>
  );
}
