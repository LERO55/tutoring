'use client';

import { Tutor, getInitials } from '@/data/tutors';

interface TutorCardProps {
  tutor: Tutor;
  onBook: () => void;
  compact?: boolean;
}

export default function TutorCard({ tutor, onBook, compact = false }: TutorCardProps) {
  if (compact) {
    // Compact horizontal card for "Other tutors" section
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0"
            style={{ background: tutor.avatarColor }}
          >
            {getInitials(tutor.name)}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {tutor.name}
              </h3>
              {tutor.available && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {tutor.sessionsCompleted} sessions • {tutor.rating} ⭐
            </p>
          </div>
          
          {/* Book Button */}
          <button
            onClick={onBook}
            className="px-4 py-2 bg-gray-100 text-gray-900 font-medium text-sm rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-[0.97] flex-shrink-0"
          >
            Book
          </button>
        </div>
      </div>
    );
  }

  // Full card (default)
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:scale-[1.02] group">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
          style={{ background: tutor.avatarColor }}
        >
          {getInitials(tutor.name)}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">
              {tutor.name}
            </h3>
            {tutor.available && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Online
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {tutor.expertise}
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{tutor.rating}</span>
            </span>
            <span className="text-gray-300">•</span>
            <span>{tutor.sessionsCompleted} sessions</span>
          </div>
        </div>
      </div>

      <button
        onClick={onBook}
        className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
      >
        Book {tutor.name}
      </button>
    </div>
  );
}
