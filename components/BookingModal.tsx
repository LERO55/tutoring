'use client';

import { useState, useEffect } from 'react';
import { Tutor, getInitials } from '@/data/tutors';

interface BookingModalProps {
  tutor: Tutor;
  onClose: () => void;
  userInfo: {
    name: string;
    email: string;
  };
  isInstantBook?: boolean;
  onBookingComplete?: () => void;
}

const TIME_SLOTS = [
  { label: 'Today 3pm', value: 'today-3pm', icon: '☀️', datetime: getDateTime(0, 15) },
  { label: 'Today 5pm', value: 'today-5pm', icon: '🌅', datetime: getDateTime(0, 17) },
  { label: 'Tomorrow 10am', value: 'tomorrow-10am', icon: '🌤️', datetime: getDateTime(1, 10) },
  { label: 'Tomorrow 2pm', value: 'tomorrow-2pm', icon: '☀️', datetime: getDateTime(1, 14) },
];

function getDateTime(daysFromNow: number, hour: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function generateCalendarLink(tutor: Tutor, datetime: Date): string {
  const endTime = new Date(datetime.getTime() + 60 * 60 * 1000);
  const startStr = datetime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endStr = endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const title = encodeURIComponent(`Tutoring: ${tutor.subject} with ${tutor.name}`);
  const details = encodeURIComponent(`Session with ${tutor.name}\nSubject: ${tutor.subject}\nExpertise: ${tutor.expertise}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
}

export default function BookingModal({ tutor, onClose, userInfo, isInstantBook = false, onBookingComplete }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookedTime, setBookedTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isInstantBook) {
      handleInstantBook();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstantBook]);

  const handleInstantBook = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setBookedTime(new Date(Date.now() + 5 * 60 * 1000));
    onBookingComplete?.();
  };

  const handleBook = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setIsSubmitted(true);
    const slot = TIME_SLOTS.find(s => s.value === selectedSlot);
    setBookedTime(slot?.datetime || new Date());
    onBookingComplete?.();
  };

  const handleAddToCalendar = () => {
    if (bookedTime) {
      window.open(generateCalendarLink(tutor, bookedTime), '_blank');
    }
  };

  // Instant Book Loading
  if (isInstantBook && isSubmitting) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-emerald-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Booking your session...
          </h3>
          <p className="text-gray-500">
            Connecting you with {tutor.name}
          </p>
        </div>
      </div>
    );
  }

  // Success State
  if (isSubmitted) {
    const prepTips = [
      `Have your ${tutor.subject.toLowerCase()} materials ready`,
      'Prepare specific questions beforehand',
      'Find a quiet place with stable internet',
    ];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          {/* Success Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600"></div>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, white 0%, transparent 50%)' }}></div>
            <div className="relative p-10 text-center text-white">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center animate-float">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                You&apos;re all set!
              </h3>
              <p className="text-emerald-100">
                {isInstantBook ? 'Session starting in a moment' : 'Your session is confirmed'}
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                  style={{ background: tutor.avatarColor }}
                >
                  {getInitials(tutor.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{tutor.name}</p>
                  <p className="text-sm text-gray-500">{tutor.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600">📅</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Session time</p>
                  <p className="font-semibold text-gray-900">
                    {bookedTime ? formatDate(bookedTime) : 'Confirmed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Add to Calendar */}
            <button
              onClick={handleAddToCalendar}
              className="w-full py-3.5 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all mb-5 flex items-center justify-center gap-2 active:scale-[0.98] btn-press"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add to Calendar
            </button>

            {/* Prep Tips */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Before your session</p>
              <div className="space-y-2">
                {prepTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Done Button */}
            <button
              onClick={onClose}
              className="w-full py-4 px-4 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all active:scale-[0.98] btn-press shadow-lg shadow-gray-900/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Booking Form
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-[2rem] md:rounded-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300">
        {/* Drag Handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
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
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-90"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Instant Book Option */}
          {tutor.available && tutor.availableIn === 'Available now' && (
            <button
              onClick={handleInstantBook}
              disabled={isSubmitting}
              className="w-full mb-5 py-4 px-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-[0.98] btn-press flex items-center justify-center gap-2"
            >
              <span className="text-xl">⚡</span>
              Start session now
            </button>
          )}

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {tutor.available && tutor.availableIn === 'Available now' ? 'Or schedule for later' : 'Pick a time'}
          </p>
        </div>

        {/* Time Slots */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                onClick={() => setSelectedSlot(slot.value)}
                className={`
                  px-4 py-4 rounded-2xl font-medium text-sm transition-all duration-200 text-left btn-press
                  ${selectedSlot === slot.value
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-lg block mb-1">{slot.icon}</span>
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Book Button */}
        <div className="p-6 pt-2 safe-bottom">
          <button
            onClick={handleBook}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 active:scale-[0.98] btn-press disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Booking...
              </span>
            ) : (
              `Confirm ${TIME_SLOTS.find(s => s.value === selectedSlot)?.label}`
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            {tutor.name} will confirm the exact time
          </p>
        </div>
      </div>
    </div>
  );
}
