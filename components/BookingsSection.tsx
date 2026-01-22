'use client';

import { tutors, getInitials, subjectIcons } from '@/data/tutors';

export interface Booking {
  id: string;
  tutorId: string;
  subject: string;
  scheduledTime: string;
  bookedAt: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface BookingsSectionProps {
  bookings: Booking[];
  onViewAll: () => void;
  onCancelBooking: (bookingId: string) => void;
  onRebook: (tutorId: string) => void;
}

function formatBookingTime(dateStr: string): { date: string; time: string; isToday: boolean; isTomorrow: boolean } {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const bookingDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const isToday = bookingDay.getTime() === today.getTime();
  const isTomorrow = bookingDay.getTime() === tomorrow.getTime();
  
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  let dateStr2: string;
  if (isToday) {
    dateStr2 = 'Today';
  } else if (isTomorrow) {
    dateStr2 = 'Tomorrow';
  } else {
    dateStr2 = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  
  return { date: dateStr2, time, isToday, isTomorrow };
}

function getTimeUntil(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return 'Started';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `In ${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `In ${hours}h ${minutes}m`;
  }
  return `In ${minutes}m`;
}

export default function BookingsSection({ bookings, onViewAll, onCancelBooking, onRebook }: BookingsSectionProps) {
  const upcomingBookings = bookings
    .filter(b => b.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  
  const nextBooking = upcomingBookings[0];
  const otherBookings = upcomingBookings.slice(1, 3);

  if (upcomingBookings.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming Sessions</h2>
        {bookings.length > 1 && (
          <button 
            onClick={onViewAll}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All ({upcomingBookings.length})
          </button>
        )}
      </div>

      {/* Next Session - Featured Card */}
      {nextBooking && (
        <NextBookingCard 
          booking={nextBooking} 
          onCancel={() => onCancelBooking(nextBooking.id)}
        />
      )}

      {/* Other Upcoming */}
      {otherBookings.length > 0 && (
        <div className="mt-3 space-y-2">
          {otherBookings.map((booking) => (
            <CompactBookingCard 
              key={booking.id} 
              booking={booking}
              onCancel={() => onCancelBooking(booking.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NextBookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const tutor = tutors.find(t => t.id === booking.tutorId);
  if (!tutor) return null;

  const { date, time, isToday } = formatBookingTime(booking.scheduledTime);
  const timeUntil = getTimeUntil(booking.scheduledTime);
  const icon = subjectIcons[booking.subject] || '📖';

  return (
    <div className={`rounded-3xl p-5 shadow-sm border ${isToday ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {timeUntil}
          </span>
          {isToday && (
            <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
              Today
            </span>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
          style={{ background: tutor.avatarColor }}
        >
          {getInitials(tutor.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-lg">{tutor.name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{icon}</span>
            <span>{booking.subject}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{time}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>

      {isToday && (
        <button className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] btn-press shadow-lg shadow-blue-600/25">
          Join Session
        </button>
      )}
    </div>
  );
}

function CompactBookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const tutor = tutors.find(t => t.id === booking.tutorId);
  if (!tutor) return null;

  const { date, time } = formatBookingTime(booking.scheduledTime);
  const icon = subjectIcons[booking.subject] || '📖';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
        style={{ background: tutor.avatarColor }}
      >
        {getInitials(tutor.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{tutor.name}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{icon}</span>
          <span>{booking.subject}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900 text-sm">{time}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <button
        onClick={onCancel}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
        aria-label="Cancel booking"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// All Bookings Modal
export function AllBookingsModal({ 
  bookings, 
  onClose, 
  onCancelBooking,
  onRebook 
}: { 
  bookings: Booking[]; 
  onClose: () => void;
  onCancelBooking: (id: string) => void;
  onRebook: (tutorId: string) => void;
}) {
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming').sort((a, b) => 
    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').sort((a, b) => 
    new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-[2rem] md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300">
        {/* Drag Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Upcoming */}
          {upcomingBookings.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Upcoming</h3>
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <BookingListItem 
                    key={booking.id} 
                    booking={booking} 
                    onCancel={() => onCancelBooking(booking.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {pastBookings.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Past Sessions</h3>
              <div className="space-y-3">
                {pastBookings.map((booking) => {
                  const tutor = tutors.find(t => t.id === booking.tutorId);
                  return (
                    <div key={booking.id} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold opacity-60"
                        style={{ background: tutor?.avatarColor || '#ccc' }}
                      >
                        {tutor ? getInitials(tutor.name) : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700">{tutor?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{booking.subject}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </span>
                      </div>
                      {booking.status === 'completed' && tutor && (
                        <button
                          onClick={() => onRebook(tutor.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Rebook
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <p className="text-gray-500 font-medium">No bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">Book a tutor to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingListItem({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const tutor = tutors.find(t => t.id === booking.tutorId);
  if (!tutor) return null;

  const { date, time, isToday } = formatBookingTime(booking.scheduledTime);
  const icon = subjectIcons[booking.subject] || '📖';

  return (
    <div className={`rounded-2xl p-4 border ${isToday ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
          style={{ background: tutor.avatarColor }}
        >
          {getInitials(tutor.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{tutor.name}</p>
            {isToday && (
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Today</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{icon}</span>
            <span>{booking.subject}</span>
            <span>•</span>
            <span>{date} at {time}</span>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
