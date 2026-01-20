'use client';

import { useState, useEffect, useMemo } from 'react';
import TutorCard from '@/components/TutorCard';
import BookingModal from '@/components/BookingModal';
import { tutors, subjectIcons, categoryColors, getInitials, type SubjectCategory } from '@/data/tutors';

interface UserInfo {
  name: string;
  email: string;
}

type CategoryFilter = 'all' | SubjectCategory;

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  stem: 'STEM',
  languages: 'Languages',
  social: 'Social',
  arts: 'Arts',
};

// Get unique subjects with their tutors
const getSubjectsWithTutors = () => {
  const subjectMap = new Map<string, typeof tutors>();
  
  tutors.forEach(tutor => {
    if (!subjectMap.has(tutor.subject)) {
      subjectMap.set(tutor.subject, []);
    }
    subjectMap.get(tutor.subject)!.push(tutor);
  });

  return Array.from(subjectMap.entries()).map(([subject, subjectTutors]) => {
    const topTutor = subjectTutors.reduce((best, current) => 
      current.rating > best.rating ? current : best
    );
    return {
      subject,
      tutorCount: subjectTutors.length,
      tutors: subjectTutors,
      topTutor,
      category: topTutor.category,
    };
  }).sort((a, b) => a.subject.localeCompare(b.subject));
};

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<typeof tutors[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const subjectsWithTutors = useMemo(() => getSubjectsWithTutors(), []);
  
  // Filter subjects by category
  const filteredSubjects = useMemo(() => {
    if (categoryFilter === 'all') return subjectsWithTutors;
    return subjectsWithTutors.filter(s => s.category === categoryFilter);
  }, [subjectsWithTutors, categoryFilter]);

  const filteredTutors = useMemo(() => {
    if (!selectedSubject) return [];
    return tutors.filter(t => t.subject === selectedSubject);
  }, [selectedSubject]);

  // Check if user info exists in localStorage
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('tutoringUserInfo');
    if (savedUserInfo) {
      const parsed = JSON.parse(savedUserInfo);
      setUserInfo(parsed);
      setShowLanding(false);
    }
  }, []);

  // Handle subject click - direct book if single tutor
  const handleSubjectClick = (subjectData: typeof subjectsWithTutors[0]) => {
    if (subjectData.tutorCount === 1) {
      // Direct booking - skip tutor selection
      setSelectedTutor(subjectData.topTutor);
      setIsModalOpen(true);
    } else {
      // Multiple tutors - show selection
      setSelectedSubject(subjectData.subject);
    }
  };

  const handleBookTutor = (tutor: typeof tutors[0]) => {
    setSelectedTutor(tutor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTutor(null);
  };

  const handleLandingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    const info = { name, email: '' };
    setUserInfo(info);
    localStorage.setItem('tutoringUserInfo', JSON.stringify(info));
    setShowLanding(false);
  };

  // Landing Screen
  if (showLanding) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center px-4">
        <div className="text-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-6xl mb-6">👋</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            Hey there!
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            What should we call you?
          </p>
          <form onSubmit={handleLandingSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              required
              autoFocus
              placeholder="Your name"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all text-gray-900 bg-white text-center text-lg font-medium placeholder:text-gray-400 placeholder:font-normal"
            />
            <button
              type="submit"
              className="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all duration-200 text-lg shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              Let&apos;s go! 🚀
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Subject Selection with Tutor Selection (if needed)
  if (!selectedSubject || filteredTutors.length <= 1) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <header className="mb-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-semibold text-gray-900">
              Hey {userInfo.name}, what subject?
            </h1>
          </header>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  categoryFilter === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Subject Grid - Clean minimal cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSubjects.map(({ subject, tutorCount, topTutor }, index) => {
              const icon = subjectIcons[subject] || '📖';
              
              return (
                <button
                  key={subject}
                  onClick={() => handleSubjectClick({ subject, tutorCount, tutors: [], topTutor, category: topTutor.category })}
                  className="bg-white rounded-2xl p-4 text-left hover:shadow-md hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 25}ms` }}
                >
                  <span className="text-2xl block mb-3">{icon}</span>
                  <div className="font-semibold text-gray-900 text-sm mb-2">{subject}</div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: topTutor.avatarColor }}
                    >
                      {getInitials(topTutor.name)}
                    </div>
                    <span className="text-xs text-gray-500">{topTutor.name}</span>
                    {tutorCount > 1 && (
                      <span className="text-xs text-gray-400">+{tutorCount - 1}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No subjects in this category.</p>
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {isModalOpen && selectedTutor && (
          <BookingModal
            tutor={selectedTutor}
            onClose={handleCloseModal}
            userInfo={userInfo}
          />
        )}
      </main>
    );
  }

  // Tutor Selection View (only for subjects with 2+ tutors)
  const selectedSubjectData = subjectsWithTutors.find(s => s.subject === selectedSubject);
  const categoryColor = selectedSubjectData ? categoryColors[selectedSubjectData.category] : categoryColors.stem;
  const subjectIcon = subjectIcons[selectedSubject] || '📖';
  const featuredTutor = filteredTutors.reduce((top, current) => 
    current.rating > top.rating ? current : top
  );
  const otherTutors = filteredTutors.filter(t => t.id !== featuredTutor.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header with Back */}
        <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 mb-3 transition-colors group text-sm"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{subjectIcon}</span>
            <h1 className="text-xl font-bold text-gray-900">{selectedSubject}</h1>
          </div>
        </div>

        {/* Featured Tutor */}
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`${categoryColor.bg} border ${categoryColor.border} rounded-2xl p-5`}>
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                style={{ background: featuredTutor.avatarColor }}
              >
                {getInitials(featuredTutor.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">⭐ Top</span>
                  {featuredTutor.available && (
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Online</span>
                  )}
                </div>
                <h2 className="font-bold text-gray-900">{featuredTutor.name}</h2>
                <p className="text-sm text-gray-600">{featuredTutor.rating} ⭐ • {featuredTutor.sessionsCompleted} sessions</p>
              </div>
              <button
                onClick={() => handleBookTutor(featuredTutor)}
                className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all active:scale-[0.97] text-sm"
              >
                Book
              </button>
            </div>
          </div>
        </div>

        {/* Other Tutors */}
        {otherTutors.length > 0 && (
          <div className="space-y-2">
            {otherTutors.map((tutor, index) => (
              <div
                key={tutor.id}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <TutorCard tutor={tutor} onBook={() => handleBookTutor(tutor)} compact />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedTutor && (
        <BookingModal
          tutor={selectedTutor}
          onClose={handleCloseModal}
          userInfo={userInfo}
        />
      )}
    </main>
  );
}
