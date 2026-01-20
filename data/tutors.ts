export type SubjectCategory = 'stem' | 'languages' | 'social' | 'arts';

export interface Tutor {
  id: string;
  name: string;
  subject: string;
  expertise: string;
  rating: number;
  sessionsCompleted: number;
  avatarColor: string;
  category: SubjectCategory;
  available?: boolean;
}

// Subject icons (emoji) mapping
export const subjectIcons: Record<string, string> = {
  'Physics': '⚛️',
  'Mathematics': '📐',
  'Chemistry': '🧪',
  'Biology': '🧬',
  'Computer Science': '💻',
  'Statistics': '📊',
  'Engineering': '⚙️',
  'Environmental Science': '🌍',
  'Economics': '📈',
  'History': '📜',
  'Geography': '🗺️',
  'Psychology': '🧠',
  'Philosophy': '💭',
  'Business Studies': '💼',
  'Spanish': '🇪🇸',
  'French': '🇫🇷',
  'Latin': '🏛️',
  'English Literature': '📚',
  'Art': '🎨',
  'Music Theory': '🎵',
};

// Category colors - more vibrant
export const categoryColors: Record<SubjectCategory, { bg: string; border: string; text: string; accent: string }> = {
  stem: { bg: 'bg-blue-100/70', border: 'border-blue-300', text: 'text-blue-700', accent: '#3b82f6' },
  languages: { bg: 'bg-violet-100/70', border: 'border-violet-300', text: 'text-violet-700', accent: '#8b5cf6' },
  social: { bg: 'bg-amber-100/70', border: 'border-amber-300', text: 'text-amber-700', accent: '#f59e0b' },
  arts: { bg: 'bg-rose-100/70', border: 'border-rose-300', text: 'text-rose-700', accent: '#f43f5e' },
};

// Avatar colors as inline styles (Tailwind can't purge these)
const avatarColors = [
  'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', // blue
  'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', // violet
  'linear-gradient(135deg, #34d399 0%, #059669 100%)', // emerald
  'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)', // rose
  'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', // amber
  'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)', // cyan
  'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', // pink
  'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)', // indigo
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', // teal
  'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', // orange
];

export const tutors: Tutor[] = [
  {
    id: '1',
    name: 'Lucas',
    subject: 'Physics',
    expertise: 'Physics expert',
    rating: 4.9,
    sessionsCompleted: 45,
    avatarColor: avatarColors[0],
    category: 'stem',
    available: true,
  },
  {
    id: '2',
    name: 'James',
    subject: 'Economics',
    expertise: 'Economics expert',
    rating: 4.8,
    sessionsCompleted: 38,
    avatarColor: avatarColors[4],
    category: 'social',
    available: true,
  },
  {
    id: '3',
    name: 'Sarah',
    subject: 'Mathematics',
    expertise: 'Mathematics expert',
    rating: 5.0,
    sessionsCompleted: 52,
    avatarColor: avatarColors[5],
    category: 'stem',
    available: true,
  },
  {
    id: '4',
    name: 'Michael',
    subject: 'Chemistry',
    expertise: 'Chemistry expert',
    rating: 4.7,
    sessionsCompleted: 41,
    avatarColor: avatarColors[8],
    category: 'stem',
    available: false,
  },
  {
    id: '5',
    name: 'Emma',
    subject: 'Biology',
    expertise: 'Biology expert',
    rating: 4.9,
    sessionsCompleted: 47,
    avatarColor: avatarColors[2],
    category: 'stem',
    available: true,
  },
  {
    id: '6',
    name: 'David',
    subject: 'Computer Science',
    expertise: 'Computer Science expert',
    rating: 4.8,
    sessionsCompleted: 39,
    avatarColor: avatarColors[7],
    category: 'stem',
    available: true,
  },
  {
    id: '7',
    name: 'Olivia',
    subject: 'English Literature',
    expertise: 'English Literature expert',
    rating: 4.9,
    sessionsCompleted: 43,
    avatarColor: avatarColors[1],
    category: 'languages',
    available: true,
  },
  {
    id: '8',
    name: 'Daniel',
    subject: 'History',
    expertise: 'History expert',
    rating: 4.6,
    sessionsCompleted: 35,
    avatarColor: avatarColors[9],
    category: 'social',
    available: false,
  },
  {
    id: '9',
    name: 'Sophia',
    subject: 'Spanish',
    expertise: 'Spanish expert',
    rating: 5.0,
    sessionsCompleted: 48,
    avatarColor: avatarColors[3],
    category: 'languages',
    available: true,
  },
  {
    id: '10',
    name: 'Matthew',
    subject: 'French',
    expertise: 'French expert',
    rating: 4.7,
    sessionsCompleted: 36,
    avatarColor: avatarColors[0],
    category: 'languages',
    available: true,
  },
  {
    id: '11',
    name: 'Isabella',
    subject: 'Art',
    expertise: 'Art expert',
    rating: 4.8,
    sessionsCompleted: 40,
    avatarColor: avatarColors[6],
    category: 'arts',
    available: true,
  },
  {
    id: '12',
    name: 'Christopher',
    subject: 'Geography',
    expertise: 'Geography expert',
    rating: 4.9,
    sessionsCompleted: 44,
    avatarColor: avatarColors[2],
    category: 'social',
    available: true,
  },
  {
    id: '13',
    name: 'Ava',
    subject: 'Psychology',
    expertise: 'Psychology expert',
    rating: 4.7,
    sessionsCompleted: 37,
    avatarColor: avatarColors[1],
    category: 'social',
    available: true,
  },
  {
    id: '14',
    name: 'Andrew',
    subject: 'Statistics',
    expertise: 'Statistics expert',
    rating: 4.8,
    sessionsCompleted: 42,
    avatarColor: avatarColors[5],
    category: 'stem',
    available: false,
  },
  {
    id: '15',
    name: 'Mia',
    subject: 'Music Theory',
    expertise: 'Music Theory expert',
    rating: 4.9,
    sessionsCompleted: 46,
    avatarColor: avatarColors[3],
    category: 'arts',
    available: true,
  },
  {
    id: '16',
    name: 'Joshua',
    subject: 'Philosophy',
    expertise: 'Philosophy expert',
    rating: 4.6,
    sessionsCompleted: 33,
    avatarColor: avatarColors[7],
    category: 'social',
    available: true,
  },
  {
    id: '17',
    name: 'Charlotte',
    subject: 'Environmental Science',
    expertise: 'Environmental Science expert',
    rating: 4.8,
    sessionsCompleted: 41,
    avatarColor: avatarColors[8],
    category: 'stem',
    available: true,
  },
  {
    id: '18',
    name: 'Ryan',
    subject: 'Business Studies',
    expertise: 'Business Studies expert',
    rating: 4.7,
    sessionsCompleted: 38,
    avatarColor: avatarColors[4],
    category: 'social',
    available: true,
  },
  {
    id: '19',
    name: 'Amelia',
    subject: 'Latin',
    expertise: 'Latin expert',
    rating: 4.9,
    sessionsCompleted: 45,
    avatarColor: avatarColors[9],
    category: 'languages',
    available: true,
  },
  {
    id: '20',
    name: 'Nathan',
    subject: 'Engineering',
    expertise: 'Engineering expert',
    rating: 4.8,
    sessionsCompleted: 40,
    avatarColor: avatarColors[0],
    category: 'stem',
    available: true,
  },
];

// Helper to get tutor initials
export const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};
