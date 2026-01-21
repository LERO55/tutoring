'use client';

import { Tutor, getInitials } from '@/data/tutors';

interface TutorCardProps {
  tutor: Tutor;
  onBook: () => void;
  onViewProfile?: () => void;
  compact?: boolean;
}

export default function TutorCard({ tutor, onBook, onViewProfile, compact = false }: TutorCardProps) {
  const topReview = tutor.reviews[0];

  if (compact) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
            style={{ background: tutor.avatarColor }}
            onClick={onViewProfile}
          >
            {getInitials(tutor.name)}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 
                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={onViewProfile}
              >
                {tutor.name}
              </h3>
              {tutor.available ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  {tutor.availableIn}
                </span>
              ) : (
                <span className="text-xs text-gray-400">{tutor.availableIn}</span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {tutor.rating} ⭐ • {tutor.sessionsCompleted} sessions
            </p>
          </div>
          
          {/* Book Button */}
          <button
            onClick={onBook}
            className="px-5 py-2.5 bg-gray-100 text-gray-900 font-semibold text-sm rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-[0.97] btn-press flex-shrink-0"
          >
            Book
          </button>
        </div>
      </div>
    );
  }

  // Full card
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
          style={{ background: tutor.avatarColor }}
          onClick={onViewProfile}
        >
          {getInitials(tutor.name)}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={onViewProfile}
            >
              {tutor.name}
            </h3>
            {tutor.available ? (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {tutor.availableIn}
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {tutor.availableIn}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {tutor.expertise}
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-amber-500">⭐</span>
              <span className="font-semibold text-gray-700">{tutor.rating}</span>
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{tutor.sessionsCompleted} sessions</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-xs text-gray-400">{tutor.responseTime}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-600 mb-4 leading-relaxed">
        "{tutor.bio}"
      </p>

      {/* Review */}
      {topReview && (
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-sm text-gray-600 italic leading-relaxed">"{topReview.comment}"</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-medium text-gray-500">— {topReview.studentName}</span>
            <span className="text-xs text-gray-400">{topReview.date}</span>
          </div>
        </div>
      )}

      <button
        onClick={onBook}
        className="w-full bg-gray-900 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] btn-press shadow-lg shadow-gray-900/15"
      >
        Book {tutor.name}
      </button>
    </div>
  );
}
