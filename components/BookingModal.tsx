'use client';

import { useState } from 'react';
import { Tutor, getInitials } from '@/data/tutors';

interface BookingModalProps {
  tutor: Tutor;
  onClose: () => void;
  userInfo: {
    name: string;
    email: string;
  };
}

// Quick time slots as chips
const TIME_SLOTS = [
  { label: 'Today 3pm', value: 'today-3pm', icon: '☀️' },
  { label: 'Today 5pm', value: 'today-5pm', icon: '🌅' },
  { label: 'Tomorrow 10am', value: 'tomorrow-10am', icon: '🌤️' },
  { label: 'Tomorrow 2pm', value: 'tomorrow-2pm', icon: '☀️' },
];

export default function BookingModal({ tutor, onClose, userInfo }: BookingModalProps) {
  // Auto-select first time slot for faster booking
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleBook = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re all set!
          </h3>
          <p className="text-gray-600">
            Your session with {tutor.name} is booked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        {/* Header with tutor info */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Tutor Avatar */}
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                style={{ background: tutor.avatarColor }}
              >
                {getInitials(tutor.name)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Book {tutor.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {tutor.subject} • {tutor.rating} ⭐
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Time selection label */}
          <p className="text-gray-500 text-sm">
            Pick a time
          </p>
        </div>

        {/* Time Slots as Chips */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot, index) => (
              <button
                key={slot.value}
                onClick={() => setSelectedSlot(slot.value)}
                className={`
                  px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 
                  ${selectedSlot === slot.value
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className="mr-1.5">{slot.icon}</span>
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Book Button - Always enabled since we auto-select */}
        <div className="p-6 pt-2 pb-8 md:pb-6">
          <button
            onClick={handleBook}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Booking...
              </span>
            ) : (
              `Confirm • ${TIME_SLOTS.find(s => s.value === selectedSlot)?.label}`
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            {tutor.name} will confirm the exact time
          </p>
        </div>
      </div>
    </div>
  );
}
