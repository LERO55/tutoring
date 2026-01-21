'use client';

import { Tutor, getInitials, subjectIcons } from '@/data/tutors';

interface TutorProfileProps {
  tutor: Tutor;
  onClose: () => void;
  onBook: () => void;
  onInstantBook?: () => void;
}

export default function TutorProfile({ tutor, onClose, onBook, onInstantBook }: TutorProfileProps) {
  const subjectIcon = subjectIcons[tutor.subject] || '📖';

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-[2rem] md:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300">
        {/* Drag Handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{subjectIcon}</span>
            <span className="font-semibold text-gray-900">{tutor.subject}</span>
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(92vh-180px)] md:max-h-[60vh]">
          <div className="p-6">
            {/* Tutor Info */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl"
                style={{ background: tutor.avatarColor }}
              >
                {getInitials(tutor.name)}
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{tutor.name}</h2>
                <p className="text-gray-600 mb-2">{tutor.expertise}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="text-amber-500">⭐</span>
                    {tutor.rating}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-gray-600">{tutor.sessionsCompleted} sessions</span>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="flex gap-3 mb-6">
              <div className={`flex-1 rounded-2xl p-4 ${tutor.available ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {tutor.available ? (
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
                  )}
                  <span className={`text-sm font-semibold ${tutor.available ? 'text-emerald-700' : 'text-gray-600'}`}>
                    {tutor.availableIn}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Availability</p>
              </div>
              <div className="flex-1 rounded-2xl p-4 bg-blue-50 border border-blue-100">
                <p className="text-sm font-semibold text-blue-700 mb-1">
                  ⚡ {tutor.responseTime?.replace('Usually responds in ', '')}
                </p>
                <p className="text-xs text-gray-500">Response time</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">About</h3>
              <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
            </div>

            {/* Reviews */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Reviews ({tutor.reviews.length})
              </h3>
              <div className="space-y-3">
                {tutor.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{review.studentName}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < review.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 safe-bottom">
          {tutor.available && tutor.availableIn === 'Available now' && onInstantBook ? (
            <div className="flex gap-3">
              <button
                onClick={onBook}
                className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98] btn-press"
              >
                Schedule
              </button>
              <button
                onClick={onInstantBook}
                className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-[0.98] btn-press shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                Book Now
              </button>
            </div>
          ) : (
            <button
              onClick={onBook}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all active:scale-[0.98] btn-press shadow-lg shadow-gray-900/20"
            >
              Book {tutor.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
