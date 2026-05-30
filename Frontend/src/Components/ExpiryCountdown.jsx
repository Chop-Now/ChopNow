import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Timer } from 'lucide-react';

const ExpiryCountdown = ({ availableUntil, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!availableUntil) return;

    const calculateTime = () => {
      const expiry = new Date(availableUntil).getTime();
      const now = new Date().getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        return false; // stop timer
      }

      setIsExpired(false);
      setTimeLeft(difference);
      return true;
    };

    calculateTime();
    const interval = setInterval(() => {
      const keepGoing = calculateTime();
      if (!keepGoing) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [availableUntil]);

  if (!availableUntil) return null;

  if (isExpired) {
    return (
      <div
        className={`flex items-center gap-1 text-red-600 font-bold ${compact ? 'text-[10px]' : 'text-xs'}`}
      >
        <AlertTriangle className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Expired</span>
      </div>
    );
  }

  if (timeLeft === null) return null;

  const seconds = Math.floor((timeLeft / 1000) % 60);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const totalHours = days * 24 + hours;

  // 12 hours or more
  if (totalHours >= 12) {
    return (
      <div
        className={`flex items-center gap-1.5 text-gray-500 font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}
      >
        <Clock className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Ends in {totalHours} hrs</span>
      </div>
    );
  }

  // Between 1 and 12 hours
  if (totalHours >= 1) {
    return (
      <div
        className={`flex items-center gap-1.5 text-amber-600 font-semibold ${compact ? 'text-[10px]' : 'text-xs'}`}
      >
        <Clock className={`animate-pulse ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        <span>
          Ends in {totalHours}h {minutes}m
        </span>
      </div>
    );
  }

  // Under 1 hour - critical ticking timer
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return (
    <div
      className={`
        flex items-center gap-1.5 text-red-600 font-extrabold
        ${
          compact
            ? 'text-[10px] animate-pulse'
            : 'text-xs bg-red-50 border border-red-100 px-2.5 py-0.75 rounded-lg shadow-sm animate-pulse'
        }
      `}
    >
      <Timer className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>
        Expires in {formattedMinutes}:{formattedSeconds}
      </span>
    </div>
  );
};

export default ExpiryCountdown;
