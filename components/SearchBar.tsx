'use client';

import { useState, useRef, useEffect } from 'react';
import { tutors, subjectIcons, getInitials } from '@/data/tutors';

interface SearchBarProps {
  onSelectTutor: (tutor: typeof tutors[0]) => void;
  onSelectSubject: (subject: string) => void;
}

export default function SearchBar({ onSelectTutor, onSelectSubject }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const subjects = [...new Set(tutors.map(t => t.subject))];

  const filteredTutors = query.length > 0 
    ? tutors.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.subject.toLowerCase().includes(query.toLowerCase()) ||
        t.expertise.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredSubjects = query.length > 0
    ? subjects.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  const hasResults = filteredTutors.length > 0 || filteredSubjects.length > 0;
  const showDropdown = isFocused && query.length > 0 && hasResults;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTutor = (tutor: typeof tutors[0]) => {
    setQuery('');
    setIsFocused(false);
    onSelectTutor(tutor);
  };

  const handleSelectSubject = (subject: string) => {
    setQuery('');
    setIsFocused(false);
    onSelectSubject(subject);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`
        flex items-center gap-3 px-5 py-4 bg-white rounded-2xl transition-all duration-300
        ${isFocused 
          ? 'shadow-lg shadow-gray-900/10 ring-2 ring-gray-900/5' 
          : 'shadow-sm border border-gray-200 hover:border-gray-300'
        }
      `}>
        <svg 
          className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isFocused ? 'text-gray-900' : 'text-gray-400'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search tutors or subjects..."
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-[16px]"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-90"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-gray-900/15 border border-gray-100 overflow-hidden z-50 animate-in fade-in scale-in duration-200">
          {/* Subjects */}
          {filteredSubjects.length > 0 && (
            <div className="p-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Subjects</p>
              {filteredSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSelectSubject(subject)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{subjectIcons[subject] || '📖'}</span>
                  <span className="font-medium text-gray-900">{subject}</span>
                  <svg className="w-4 h-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {filteredSubjects.length > 0 && filteredTutors.length > 0 && (
            <div className="border-t border-gray-100 mx-3" />
          )}

          {/* Tutors */}
          {filteredTutors.length > 0 && (
            <div className="p-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Tutors</p>
              {filteredTutors.map((tutor) => (
                <button
                  key={tutor.id}
                  onClick={() => handleSelectTutor(tutor)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:scale-105 transition-transform"
                    style={{ background: tutor.avatarColor }}
                  >
                    {getInitials(tutor.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{tutor.name}</span>
                      {tutor.available && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{tutor.subject} • {tutor.rating} ⭐</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
