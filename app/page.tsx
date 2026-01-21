'use client';

import { useState, useEffect, useMemo } from 'react';
import TutorCard from '@/components/TutorCard';
import BookingModal from '@/components/BookingModal';
import SearchBar from '@/components/SearchBar';
import TutorProfile from '@/components/TutorProfile';
import { tutors, subjectIcons, categoryColors, getInitials, getPopularSubjects, type SubjectCategory } from '@/data/tutors';

interface UserInfo {
  name: string;
  email: string;
  favoriteSubjects?: string[];
}

interface BookingHistory {
  tutorId: string;
  subject: string;
  date: string;
}

type CategoryFilter = 'all' | SubjectCategory;

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All Subjects',
  stem: 'STEM',
  languages: 'Languages',
  social: 'Social Sciences',
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
  const [onboardingStep, setOnboardingStep] = useState<'name' | 'subjects'>('name');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [tempSelectedSubjects, setTempSelectedSubjects] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<typeof tutors[0] | null>(null);
  const [viewingTutor, setViewingTutor] = useState<typeof tutors[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstantBook, setIsInstantBook] = useState(false);
  const [recentTutors, setRecentTutors] = useState<typeof tutors>([]);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);

  const subjectsWithTutors = useMemo(() => getSubjectsWithTutors(), []);
  const popularSubjects = useMemo(() => getPopularSubjects(), []);
  
  const filteredSubjects = useMemo(() => {
    if (categoryFilter === 'all') return subjectsWithTutors;
    return subjectsWithTutors.filter(s => s.category === categoryFilter);
  }, [subjectsWithTutors, categoryFilter]);

  const filteredTutors = useMemo(() => {
    if (!selectedSubject) return [];
    return tutors.filter(t => t.subject === selectedSubject);
  }, [selectedSubject]);

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('tutoringUserInfo');
    const savedRecentTutors = localStorage.getItem('tutoringRecentTutors');
    const savedBookings = localStorage.getItem('tutoringBookings');
    
    if (savedUserInfo) {
      const parsed = JSON.parse(savedUserInfo);
      setUserInfo(parsed);
      setShowLanding(false);
    }
    if (savedRecentTutors) {
      const tutorIds = JSON.parse(savedRecentTutors);
      const recent = tutorIds.map((id: string) => tutors.find(t => t.id === id)).filter(Boolean);
      setRecentTutors(recent);
    }
    if (savedBookings) {
      setBookingHistory(JSON.parse(savedBookings));
    }
  }, []);

  const trackRecentTutor = (tutor: typeof tutors[0]) => {
    setRecentTutors(prev => {
      const filtered = prev.filter(t => t.id !== tutor.id);
      const updated = [tutor, ...filtered].slice(0, 3);
      localStorage.setItem('tutoringRecentTutors', JSON.stringify(updated.map(t => t.id)));
      return updated;
    });
  };

  const handleSubjectClick = (subjectData: typeof subjectsWithTutors[0]) => {
    if (subjectData.tutorCount === 1) {
      setSelectedTutor(subjectData.topTutor);
      trackRecentTutor(subjectData.topTutor);
      setIsModalOpen(true);
    } else {
      setSelectedSubject(subjectData.subject);
    }
  };

  const handleViewProfile = (tutor: typeof tutors[0]) => {
    setViewingTutor(tutor);
    trackRecentTutor(tutor);
  };

  const handleBookTutor = (tutor: typeof tutors[0], instant = false) => {
    setSelectedTutor(tutor);
    setIsInstantBook(instant);
    trackRecentTutor(tutor);
    setIsModalOpen(true);
    setViewingTutor(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTutor(null);
    setIsInstantBook(false);
  };

  const handleBookingComplete = (tutor: typeof tutors[0]) => {
    const newBooking: BookingHistory = {
      tutorId: tutor.id,
      subject: tutor.subject,
      date: new Date().toISOString(),
    };
    const updated = [newBooking, ...bookingHistory].slice(0, 10);
    setBookingHistory(updated);
    localStorage.setItem('tutoringBookings', JSON.stringify(updated));
  };

  const handleSearchSelectTutor = (tutor: typeof tutors[0]) => {
    handleViewProfile(tutor);
  };

  const handleSearchSelectSubject = (subject: string) => {
    const subjectData = subjectsWithTutors.find(s => s.subject === subject);
    if (subjectData) {
      handleSubjectClick(subjectData);
    }
  };

  const handleLandingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    setUserInfo(prev => ({ ...prev, name }));
    setOnboardingStep('subjects');
  };

  const handleSubjectsSubmit = (selectedSubjects: string[]) => {
    const info = { ...userInfo, favoriteSubjects: selectedSubjects };
    setUserInfo(info);
    localStorage.setItem('tutoringUserInfo', JSON.stringify(info));
    setShowLanding(false);
  };

  const handleSkipSubjects = () => {
    localStorage.setItem('tutoringUserInfo', JSON.stringify(userInfo));
    setShowLanding(false);
  };

  const toggleSubject = (subject: string) => {
    setTempSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : prev.length < 3 ? [...prev, subject] : prev
    );
  };

  // Landing Screen - Name Input
  if (showLanding && onboardingStep === 'name') {
    return (
      <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-6">
        <div className="text-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-float">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3 tracking-tight">
            Find Your Tutor
          </h1>
          <p className="text-lg text-gray-500 mb-10">
            Expert help is just a tap away
          </p>
          <form onSubmit={handleLandingSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              required
              autoFocus
              placeholder="What's your name?"
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-900 bg-white text-center text-lg font-medium placeholder:text-gray-400 placeholder:font-normal shadow-sm"
            />
            <button
              type="submit"
              className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-200 text-lg shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/25 active:scale-[0.98] btn-press"
            >
              Get Started
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Landing Screen - Subject Selection
  if (showLanding && onboardingStep === 'subjects') {
    return (
      <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
              Hey {userInfo.name}!
            </h1>
            <p className="text-gray-500 text-lg">
              Pick up to 3 subjects to personalize your experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-10">
            {subjectsWithTutors.slice(0, 12).map(({ subject }, index) => {
              const isSelected = tempSelectedSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.97] btn-press animate-in fade-in slide-up ${
                    isSelected 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                      : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <span className="text-2xl block mb-2">{subjectIcons[subject] || '📖'}</span>
                  <span className="font-medium text-sm">{subject}</span>
                  {isSelected && (
                    <span className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSubjectsSubmit(tempSelectedSubjects)}
              disabled={tempSelectedSubjects.length === 0}
              className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-200 text-lg shadow-lg shadow-gray-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] btn-press"
            >
              Continue
              {tempSelectedSubjects.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                  {tempSelectedSubjects.length}
                </span>
              )}
            </button>
            <button
              onClick={handleSkipSubjects}
              className="w-full px-8 py-3 text-gray-500 font-medium rounded-2xl hover:bg-gray-100 transition-all duration-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Main Dashboard View
  if (!selectedSubject || filteredTutors.length <= 1) {
    const userFavoriteSubjects = userInfo.favoriteSubjects || [];
    const favoriteSubjectsData = subjectsWithTutors.filter(s => userFavoriteSubjects.includes(s.subject));
    const lastBookedTutor = bookingHistory.length > 0 
      ? tutors.find(t => t.id === bookingHistory[0].tutorId)
      : null;

    return (
      <main className="min-h-screen bg-[#f5f5f7]">
        <div className="container mx-auto px-5 py-8 max-w-4xl">
          {/* Header */}
          <header className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Welcome back</p>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  {userInfo.name}
                </h1>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/25">
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <SearchBar 
              onSelectTutor={handleSearchSelectTutor}
              onSelectSubject={handleSearchSelectSubject}
            />
          </header>

          {/* Quick Rebook */}
          {lastBookedTutor && (
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '50ms' }}>
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-5 text-white shadow-xl shadow-gray-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                      style={{ background: lastBookedTutor.avatarColor }}
                    >
                      {getInitials(lastBookedTutor.name)}
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-0.5">Book again with</p>
                      <p className="font-semibold text-lg">{lastBookedTutor.name}</p>
                      <p className="text-sm text-gray-400">{lastBookedTutor.subject}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookTutor(lastBookedTutor)}
                    className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all active:scale-[0.97] btn-press shadow-lg"
                  >
                    Rebook
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Recent Tutors */}
          {recentTutors.length > 0 && (
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">Recent</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                {recentTutors.map((tutor, index) => (
                  <button
                    key={tutor.id}
                    onClick={() => handleViewProfile(tutor)}
                    className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all active:scale-[0.98] btn-press w-36 animate-in fade-in slide-up"
                    style={{ animationDelay: `${100 + index * 50}ms` }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-3 shadow-md"
                      style={{ background: tutor.avatarColor }}
                    >
                      {getInitials(tutor.name)}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm truncate">{tutor.name}</p>
                    <p className="text-xs text-gray-500 truncate">{tutor.subject}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Your Subjects */}
          {favoriteSubjectsData.length > 0 && (
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '150ms' }}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">Your Subjects</h2>
              <div className="grid grid-cols-3 gap-3">
                {favoriteSubjectsData.map(({ subject, topTutor, tutorCount }, index) => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectClick({ subject, tutorCount, tutors: [], topTutor, category: topTutor.category })}
                    className="bg-white rounded-2xl p-4 text-left shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-200 active:scale-[0.98] btn-press animate-in fade-in slide-up"
                    style={{ animationDelay: `${150 + index * 30}ms` }}
                  >
                    <span className="text-2xl block mb-2">{subjectIcons[subject] || '📖'}</span>
                    <div className="font-semibold text-gray-900 text-sm truncate">{subject}</div>
                    <div className="text-xs text-gray-400 mt-1">{tutorCount} tutor{tutorCount > 1 ? 's' : ''}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Popular */}
          <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">Popular</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {popularSubjects.map((subject, index) => (
                <button
                  key={subject}
                  onClick={() => handleSearchSelectSubject(subject)}
                  className="flex-shrink-0 px-4 py-2.5 bg-white rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.97] btn-press shadow-sm animate-in fade-in slide-up"
                  style={{ animationDelay: `${200 + index * 30}ms` }}
                >
                  <span className="mr-1.5">{subjectIcons[subject]}</span>
                  {subject}
                </button>
              ))}
            </div>
          </section>

          {/* Category Tabs */}
          <div className="mb-6 animate-in fade-in duration-500" style={{ animationDelay: '250ms' }}>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 btn-press ${
                    categoryFilter === cat
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSubjects.map(({ subject, tutorCount, topTutor }, index) => {
              const icon = subjectIcons[subject] || '📖';
              
              return (
                <button
                  key={subject}
                  onClick={() => handleSubjectClick({ subject, tutorCount, tutors: [], topTutor, category: topTutor.category })}
                  className="bg-white rounded-2xl p-5 text-left shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-200 active:scale-[0.98] btn-press animate-in fade-in slide-up group"
                  style={{ animationDelay: `${300 + index * 20}ms` }}
                >
                  <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{icon}</span>
                  <div className="font-semibold text-gray-900 mb-2">{subject}</div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                      style={{ background: topTutor.avatarColor }}
                    >
                      {getInitials(topTutor.name)}
                    </div>
                    <span className="text-sm text-gray-500">{topTutor.name}</span>
                    {tutorCount > 1 && (
                      <span className="text-sm text-gray-400">+{tutorCount - 1}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {filteredSubjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-gray-500 font-medium">No subjects in this category</p>
            </div>
          )}

          {/* Bottom padding for mobile */}
          <div className="h-8"></div>
        </div>

        {/* Tutor Profile Modal */}
        {viewingTutor && (
          <TutorProfile
            tutor={viewingTutor}
            onClose={() => setViewingTutor(null)}
            onBook={() => handleBookTutor(viewingTutor)}
            onInstantBook={viewingTutor.available && viewingTutor.availableIn === 'Available now' ? () => handleBookTutor(viewingTutor, true) : undefined}
          />
        )}

        {/* Booking Modal */}
        {isModalOpen && selectedTutor && (
          <BookingModal
            tutor={selectedTutor}
            onClose={handleCloseModal}
            userInfo={userInfo}
            isInstantBook={isInstantBook}
            onBookingComplete={() => handleBookingComplete(selectedTutor)}
          />
        )}
      </main>
    );
  }

  // Tutor Selection View
  const selectedSubjectData = subjectsWithTutors.find(s => s.subject === selectedSubject);
  const categoryColor = selectedSubjectData ? categoryColors[selectedSubjectData.category] : categoryColors.stem;
  const subjectIcon = subjectIcons[selectedSubject] || '📖';
  const featuredTutor = filteredTutors.reduce((top, current) => 
    current.rating > top.rating ? current : top
  );
  const otherTutors = filteredTutors.filter(t => t.id !== featuredTutor.id);

  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      <div className="container mx-auto px-5 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-300">
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors group text-sm font-medium"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <span className="text-3xl">{subjectIcon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedSubject}</h1>
              <p className="text-gray-500 text-sm">{filteredTutors.length} tutors available</p>
            </div>
          </div>
        </div>

        {/* Featured Tutor */}
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform"
                style={{ background: featuredTutor.avatarColor }}
                onClick={() => handleViewProfile(featuredTutor)}
              >
                {getInitials(featuredTutor.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">★ Top Rated</span>
                  {featuredTutor.available && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      {featuredTutor.availableIn}
                    </span>
                  )}
                </div>
                <h2 
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleViewProfile(featuredTutor)}
                >
                  {featuredTutor.name}
                </h2>
                <p className="text-gray-500 text-sm">{featuredTutor.rating} ⭐ • {featuredTutor.sessionsCompleted} sessions</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-5 leading-relaxed">"{featuredTutor.bio}"</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleViewProfile(featuredTutor)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98] btn-press"
              >
                View Profile
              </button>
              <button
                onClick={() => handleBookTutor(featuredTutor)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all active:scale-[0.98] btn-press shadow-lg shadow-gray-900/20"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Other Tutors */}
        {otherTutors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mt-6 mb-3">Other Tutors</h3>
            {otherTutors.map((tutor, index) => (
              <div
                key={tutor.id}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <TutorCard 
                  tutor={tutor} 
                  onBook={() => handleBookTutor(tutor)} 
                  onViewProfile={() => handleViewProfile(tutor)}
                  compact 
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-8"></div>
      </div>

      {/* Tutor Profile Modal */}
      {viewingTutor && (
        <TutorProfile
          tutor={viewingTutor}
          onClose={() => setViewingTutor(null)}
          onBook={() => handleBookTutor(viewingTutor)}
          onInstantBook={viewingTutor.available && viewingTutor.availableIn === 'Available now' ? () => handleBookTutor(viewingTutor, true) : undefined}
        />
      )}

      {/* Booking Modal */}
      {isModalOpen && selectedTutor && (
        <BookingModal
          tutor={selectedTutor}
          onClose={handleCloseModal}
          userInfo={userInfo}
          isInstantBook={isInstantBook}
          onBookingComplete={() => handleBookingComplete(selectedTutor)}
        />
      )}
    </main>
  );
}
