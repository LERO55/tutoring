'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { tutors, getInitials, subjectIcons } from '@/data/tutors';
import { getSuggestedSlots, createCalendarEvent, formatSlotTime } from '@/lib/calendar';

type Screen = 'welcome' | 'home' | 'matching' | 'tutor' | 'booking' | 'confirmed' | 'session' | 'feedback';

interface UserPrefs {
  lastTutorId?: string;
  lastSubject?: string;
  favoriteSubjects: string[];
  sessionCount: number;
  lastQuery?: string;
}

interface MatchedTutor {
  tutor: typeof tutors[0];
  relevance: number;
  reason: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const PLACEHOLDERS = [
  "GCSE Maths exam tomorrow",
  "Help with Spanish homework", 
  "Physics problem sets",
  "Essay writing feedback",
];

function findBestMatch(query: string, prefs: UserPrefs): MatchedTutor {
  const queryLower = query.toLowerCase();
  
  const scored = tutors.map(tutor => {
    let score = 0;
    let reason = '';
    
    if (tutor.subject.toLowerCase().includes(queryLower) || 
        queryLower.includes(tutor.subject.toLowerCase())) {
      score += 50;
      reason = `Expert in ${tutor.subject}`;
    }
    
    const keywords = queryLower.split(' ');
    keywords.forEach(word => {
      if (tutor.subject.toLowerCase().includes(word)) score += 20;
      if (tutor.expertise.toLowerCase().includes(word)) score += 15;
    });
    
    if (tutor.available && tutor.availableIn === 'Available now') {
      score += 30;
      if (!reason) reason = 'Available right now';
    }
    
    score += tutor.rating * 5;
    
    if (prefs.lastTutorId === tutor.id) {
      score += 15;
      reason = 'Your previous tutor';
    }
    
    return { tutor, relevance: score, reason: reason || `${tutor.rating}★ • ${tutor.sessionsCompleted} sessions` };
  });
  
  scored.sort((a, b) => b.relevance - a.relevance);
  return scored[0];
}

function getAvailableCount(): number {
  return tutors.filter(t => t.available).length;
}

// Toast component
function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`toast animate-toast-in ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
      <span className="flex items-center gap-2">
        {toast.type === 'success' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {toast.message}
      </span>
    </div>
  );
}

// Star rating component
function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl transition-all hover:bg-neutral-200 hover:scale-105 active:scale-95"
        >
          <span className={(hovered >= star || rating >= star) ? 'opacity-100' : 'opacity-30'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, user, login, logout, inProgress, msalInstance } = useAuth();
  
  const [screen, setScreen] = useState<Screen>('welcome');
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [matchedTutor, setMatchedTutor] = useState<MatchedTutor | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs>({
    favoriteSubjects: [],
    sessionCount: 0,
  });
  const [freeSlots, setFreeSlots] = useState<Date[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [calendarEventId, setCalendarEventId] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Check auth state
  useEffect(() => {
    if (isAuthenticated && user) {
      setScreen('home');
    }
  }, [isAuthenticated, user]);

  // Load prefs
  useEffect(() => {
    const savedPrefs = localStorage.getItem('tutorPrefs');
    if (savedPrefs) {
      setPrefs(JSON.parse(savedPrefs));
    }
  }, []);

  // Rotate placeholders
  useEffect(() => {
    if (screen !== 'home') return;
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [screen]);

  // Session timer
  useEffect(() => {
    if (screen !== 'session') {
      setSessionTimer(0);
      return;
    }
    const interval = setInterval(() => {
      setSessionTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [screen]);

  // Focus input on home
  useEffect(() => {
    if (screen === 'home' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [screen]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const savePrefs = useCallback((updates: Partial<UserPrefs>) => {
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);
    localStorage.setItem('tutorPrefs', JSON.stringify(newPrefs));
  }, [prefs]);

  const handleLogin = async () => {
    await login();
  };

  const handleLogout = () => {
    localStorage.removeItem('tutorPrefs');
    logout();
    setScreen('welcome');
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    savePrefs({ lastQuery: query });
    setScreen('matching');
    
    setTimeout(() => {
      const match = findBestMatch(query, prefs);
      setMatchedTutor(match);
      setScreen('tutor');
    }, 800);
  };

  const handleQuickRebook = () => {
    if (prefs.lastTutorId) {
      const lastTutor = tutors.find(t => t.id === prefs.lastTutorId);
      if (lastTutor) {
        setMatchedTutor({
          tutor: lastTutor,
          relevance: 100,
          reason: 'Your previous tutor',
        });
        setScreen('tutor');
      }
    }
  };

  const handleBook = async (instant = false) => {
    if (instant) {
      const now = new Date();
      setSelectedTime(now);
      await completeBooking(now);
    } else {
      setScreen('booking');
      setLoadingSlots(true);
      
      if (msalInstance) {
        try {
          const slots = await getSuggestedSlots(msalInstance, 60, 5);
          setFreeSlots(slots);
        } catch (error) {
          console.error('Failed to get calendar slots:', error);
          const now = new Date();
          const fallbackSlots = [
            new Date(now.getTime() + 30 * 60000),
            new Date(now.getTime() + 60 * 60000),
            new Date(now.getTime() + 120 * 60000),
            new Date(now.getTime() + 180 * 60000),
            new Date(now.getTime() + 240 * 60000),
          ];
          setFreeSlots(fallbackSlots);
        }
      } else {
        const now = new Date();
        setFreeSlots([
          new Date(now.getTime() + 30 * 60000),
          new Date(now.getTime() + 60 * 60000),
          new Date(now.getTime() + 120 * 60000),
          new Date(now.getTime() + 180 * 60000),
          new Date(now.getTime() + 240 * 60000),
        ]);
      }
      
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = async (time: Date) => {
    setSelectedTime(time);
    await completeBooking(time);
  };

  const completeBooking = async (startTime: Date) => {
    setScreen('confirmed');
    setCreatingEvent(true);
    setCalendarEventId(null);
    
    if (matchedTutor) {
      savePrefs({
        lastTutorId: matchedTutor.tutor.id,
        lastSubject: matchedTutor.tutor.subject,
        sessionCount: prefs.sessionCount + 1,
      });
      
      if (msalInstance) {
        try {
          const endTime = new Date(startTime.getTime() + 60 * 60000);
          const event = await createCalendarEvent(msalInstance, {
            subject: `Tutoring: ${matchedTutor.tutor.subject} with ${matchedTutor.tutor.name}`,
            start: startTime,
            end: endTime,
            body: `Peer tutoring session for ${matchedTutor.tutor.subject}.\n\nTutor: ${matchedTutor.tutor.name}\nExpertise: ${matchedTutor.tutor.expertise}`,
            location: 'Online (Teams)',
          });
          setCalendarEventId(event.id || null);
        } catch (error) {
          console.error('Failed to create calendar event:', error);
        }
      }
    }
    
    setCreatingEvent(false);
    setTimeout(() => setScreen('session'), 2500);
  };

  const handleEndSession = () => {
    setFeedbackRating(0);
    setScreen('feedback');
  };

  const handleFeedback = (rating: number) => {
    setFeedbackRating(rating);
    showToast(rating >= 4 ? 'Thanks for the feedback!' : 'Thanks, we\'ll work on improving');
    
    setTimeout(() => {
      setScreen('home');
      setQuery('');
      setMatchedTutor(null);
      setSelectedTime(null);
      setCalendarEventId(null);
    }, 800);
  };

  const handleSeeOthers = () => {
    const otherTutors = tutors.filter(t => t.id !== matchedTutor?.tutor.id);
    const scored = otherTutors.map(tutor => ({
      tutor,
      relevance: tutor.rating * 10 + (tutor.available ? 20 : 0),
      reason: `${tutor.rating}★ • ${tutor.sessionsCompleted} sessions`,
    }));
    scored.sort((a, b) => b.relevance - a.relevance);
    setMatchedTutor(scored[0]);
  };

  const getLastTutor = () => {
    if (!prefs.lastTutorId) return null;
    return tutors.find(t => t.id === prefs.lastTutorId) || null;
  };

  // ============================================
  // WELCOME - Microsoft Login
  // ============================================
  if (screen === 'welcome' || !isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white safe-bottom">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-[22px] bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-center justify-center shadow-lg">
            <span className="text-4xl">📚</span>
          </div>
          
          <h1 className="text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">
            Peer Tutoring
          </h1>
          <p className="text-neutral-500 mb-12 text-lg">
            Get instant help from top students
          </p>
          
          <button
            onClick={handleLogin}
            disabled={inProgress}
            className="w-full py-4 bg-neutral-900 text-white font-medium rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-neutral-900/20"
          >
            {inProgress ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
            )}
            {inProgress ? 'Signing in...' : 'Continue with Microsoft'}
          </button>
          
          <p className="mt-6 text-sm text-neutral-400">
            Sign in with your school account
          </p>
        </div>
      </main>
    );
  }

  // ============================================
  // HOME - Main Input with User Info
  // ============================================
  if (screen === 'home') {
    const availableCount = getAvailableCount();
    const lastTutor = getLastTutor();
    
    return (
      <main className="min-h-screen flex flex-col bg-white">
        {/* User Profile Header */}
        <header className="px-6 py-5 border-b border-neutral-100">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-md bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-neutral-900 leading-tight">{user?.name}</p>
                <p className="text-sm text-neutral-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors py-2 px-3 -mr-3 rounded-lg hover:bg-neutral-100"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl">
            {/* Quick Rebook Card */}
            {lastTutor && (
              <div className="mb-8 animate-fade-in">
                <button
                  onClick={handleQuickRebook}
                  className="w-full p-4 bg-neutral-50 rounded-2xl flex items-center gap-4 transition-all hover:bg-neutral-100 active:scale-[0.99] group"
                >
                  <div 
                    className="avatar avatar-md text-white"
                    style={{ background: lastTutor.avatarColor }}
                  >
                    {getInitials(lastTutor.name)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-neutral-500">Book again</p>
                    <p className="font-medium text-neutral-900">{lastTutor.name} • {lastTutor.subject}</p>
                  </div>
                  <svg className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            <div className="animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 text-center mb-8 tracking-tight">
                What do you need help with?
              </h2>
              
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={PLACEHOLDERS[placeholderIndex]}
                  className="w-full px-6 py-5 text-lg sm:text-xl bg-white border-2 border-neutral-200 rounded-2xl focus:border-neutral-900 transition-all placeholder:text-neutral-300 outline-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!query.trim()}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    query.trim() 
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 shadow-md' 
                      : 'bg-neutral-100 text-neutral-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              <p className="text-center text-sm text-neutral-400 mt-6">
                <span className="inline-flex items-center gap-2">
                  <span className="status-dot status-dot-online status-dot-pulse"></span>
                  {availableCount} tutors available now
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Toasts */}
        {toasts.map(toast => (
          <ToastNotification key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </main>
    );
  }

  // ============================================
  // MATCHING
  // ============================================
  if (screen === 'matching') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto mb-8 rounded-full border-[3px] border-neutral-200 border-t-neutral-900 animate-spin"></div>
          <p className="text-lg text-neutral-500">Finding your perfect match...</p>
        </div>
      </main>
    );
  }

  // ============================================
  // TUTOR
  // ============================================
  if (screen === 'tutor' && matchedTutor) {
    const { tutor } = matchedTutor;
    const isAvailableNow = tutor.available && tutor.availableIn === 'Available now';
    const icon = subjectIcons[tutor.subject] || '📚';

    return (
      <main className="min-h-screen flex flex-col px-6 py-8 bg-white safe-bottom">
        <button
          onClick={() => { setScreen('home'); setQuery(''); }}
          className="self-start p-2 -ml-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="animate-slide-up text-center">
            <div 
              className="avatar avatar-xl text-white mx-auto mb-6 shadow-xl"
              style={{ background: tutor.avatarColor }}
            >
              {getInitials(tutor.name)}
            </div>

            <h1 className="text-3xl font-semibold text-neutral-900 mb-1 tracking-tight">{tutor.name}</h1>
            
            <p className="text-neutral-500 mb-6 flex items-center justify-center gap-2">
              <span>{icon}</span>
              <span>{tutor.subject}</span>
              <span className="text-neutral-300">•</span>
              <span className="text-amber-500">★</span>
              <span>{tutor.rating}</span>
            </p>

            <p className="text-neutral-600 mb-8 leading-relaxed max-w-xs mx-auto">
              {tutor.bio}
            </p>

            <button
              onClick={() => handleBook(isAvailableNow)}
              className={`w-full py-4 text-white text-lg font-medium rounded-2xl transition-all active:scale-[0.98] shadow-lg ${
                isAvailableNow 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                  : 'bg-neutral-900 hover:bg-neutral-800 shadow-neutral-900/20'
              }`}
            >
              {isAvailableNow ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Start now
                </span>
              ) : (
                `Book for ${tutor.availableIn?.replace('In ', '').replace('Tomorrow', 'tomorrow')}`
              )}
            </button>

            <button
              onClick={handleSeeOthers}
              className="mt-4 py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              See other tutors
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // BOOKING
  // ============================================
  if (screen === 'booking' && matchedTutor) {
    return (
      <main className="min-h-screen flex flex-col px-6 py-8 bg-white safe-bottom">
        <button
          onClick={() => setScreen('tutor')}
          className="self-start p-2 -ml-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="animate-slide-up w-full text-center">
            <div className="badge badge-success mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Synced with your calendar
            </div>
            
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2 tracking-tight">Pick a time</h1>
            <p className="text-neutral-500 mb-8">
              Session with <span className="font-medium text-neutral-700">{matchedTutor.tutor.name}</span>
            </p>

            {loadingSlots ? (
              <div className="flex flex-col items-center py-16">
                <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-4" />
                <p className="text-neutral-500">Checking your calendar...</p>
              </div>
            ) : (
              <div className="w-full space-y-2">
                {freeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSelect(slot)}
                    className={`w-full p-4 bg-neutral-50 rounded-xl text-left transition-all hover:bg-neutral-100 active:scale-[0.99] flex items-center justify-between group animate-fade-in stagger-${index + 1}`}
                    style={{ animationFillMode: 'both' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-neutral-400 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-900">{formatSlotTime(slot)}</span>
                        <p className="text-sm text-neutral-400">1 hour session</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
                
                {freeSlots.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-neutral-500">No free slots found</p>
                    <p className="text-sm text-neutral-400 mt-1">Try again later</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // CONFIRMED
  // ============================================
  if (screen === 'confirmed' && matchedTutor) {
    const isNow = selectedTime && (new Date().getTime() - selectedTime.getTime()) < 60000;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center animate-scale-in max-w-sm">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-50 flex items-center justify-center">
            {creatingEvent ? (
              <div className="w-8 h-8 border-[3px] border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="animate-checkmark" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2 tracking-tight">
            {creatingEvent ? 'Adding to calendar...' : isNow ? 'Starting now' : 'You\'re booked!'}
          </h1>
          <p className="text-neutral-500 mb-6">
            {isNow ? 'Connecting you with ' : 'Session with '}<span className="font-medium text-neutral-700">{matchedTutor.tutor.name}</span>
          </p>
          
          {!creatingEvent && selectedTime && !isNow && (
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-100 rounded-full text-sm font-medium text-neutral-700">
              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatSlotTime(selectedTime)}
            </div>
          )}
          
          {!creatingEvent && calendarEventId && (
            <p className="text-sm text-emerald-600 mt-6 flex items-center justify-center gap-1.5 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added to your Outlook calendar
            </p>
          )}
        </div>
      </main>
    );
  }

  // ============================================
  // SESSION
  // ============================================
  if (screen === 'session' && matchedTutor) {
    const { tutor } = matchedTutor;

    return (
      <main className="min-h-screen bg-neutral-900 flex flex-col safe-bottom">
        <div className="flex-1 relative flex items-center justify-center">
          {/* Ambient glow */}
          <div 
            className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: tutor.avatarColor }}
          />
          
          <div 
            className="relative w-36 h-36 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl animate-scale-in"
            style={{ background: tutor.avatarColor }}
          >
            {getInitials(tutor.name)}
          </div>
          
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between">
            <div className="text-white/80">
              <p className="text-sm text-white/60">In session with</p>
              <p className="font-semibold text-lg">{tutor.name}</p>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-full text-white font-mono text-lg backdrop-blur-sm">
              {formatTimer(sessionTimer)}
            </div>
          </div>

          {/* Subject badge */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
            <div className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm backdrop-blur-sm">
              {tutor.subject}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 flex items-center justify-center gap-4">
          <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button 
            onClick={handleEndSession}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </main>
    );
  }

  // ============================================
  // FEEDBACK
  // ============================================
  if (screen === 'feedback' && matchedTutor) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white safe-bottom">
        <div className="text-center max-w-md animate-slide-up">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-neutral-100 flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          
          <p className="text-neutral-500 mb-2">Session complete</p>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-8 tracking-tight">
            How was your session with {matchedTutor.tutor.name}?
          </h1>

          <div className="flex items-center justify-center mb-10">
            <StarRating rating={feedbackRating} onRate={handleFeedback} />
          </div>

          <button
            onClick={() => { setMatchedTutor(matchedTutor); setScreen('tutor'); }}
            className="w-full py-4 bg-neutral-900 text-white text-lg font-medium rounded-2xl hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-lg shadow-neutral-900/20"
          >
            Book again with {matchedTutor.tutor.name.split(' ')[0]}
          </button>
          
          <button
            onClick={() => { setScreen('home'); setQuery(''); setMatchedTutor(null); }}
            className="mt-3 py-3 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Back to home
          </button>
        </div>
        
        {/* Toasts */}
        {toasts.map(toast => (
          <ToastNotification key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </main>
    );
  }

  return null;
}
