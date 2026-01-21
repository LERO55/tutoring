export type SubjectCategory = 'stem' | 'languages' | 'social' | 'arts';

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Tutor {
  id: string;
  name: string;
  subject: string;
  expertise: string;
  bio: string;
  rating: number;
  sessionsCompleted: number;
  avatarColor: string;
  category: SubjectCategory;
  available?: boolean;
  availableIn?: string; // e.g., "Available now", "In 2 hours", "Tomorrow"
  responseTime: string; // e.g., "Usually responds in 10 min"
  reviews: Review[];
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
    expertise: 'Mechanics & Thermodynamics',
    bio: 'I make complex physics concepts click through real-world examples and visual explanations.',
    rating: 4.9,
    sessionsCompleted: 45,
    avatarColor: avatarColors[0],
    category: 'stem',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 5 min',
    reviews: [
      { id: 'r1', studentName: 'Alex', rating: 5, comment: 'Lucas explained thermodynamics in a way that finally made sense!', date: '2 days ago' },
      { id: 'r2', studentName: 'Jordan', rating: 5, comment: 'Super patient and really knows his stuff.', date: '1 week ago' },
    ],
  },
  {
    id: '2',
    name: 'James',
    subject: 'Economics',
    expertise: 'Micro & Macroeconomics',
    bio: 'I connect economic theory to current events so you understand why it matters.',
    rating: 4.8,
    sessionsCompleted: 38,
    avatarColor: avatarColors[4],
    category: 'social',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 15 min',
    reviews: [
      { id: 'r3', studentName: 'Morgan', rating: 5, comment: 'James made supply and demand actually interesting.', date: '3 days ago' },
      { id: 'r4', studentName: 'Casey', rating: 4, comment: 'Great at breaking down complex graphs.', date: '1 week ago' },
    ],
  },
  {
    id: '3',
    name: 'Sarah',
    subject: 'Mathematics',
    expertise: 'Calculus & Linear Algebra',
    bio: 'I believe anyone can be good at math with the right approach and practice.',
    rating: 5.0,
    sessionsCompleted: 52,
    avatarColor: avatarColors[5],
    category: 'stem',
    available: true,
    availableIn: 'In 1 hour',
    responseTime: 'Usually responds in 10 min',
    reviews: [
      { id: 'r5', studentName: 'Taylor', rating: 5, comment: 'Sarah is amazing! Went from failing to an A in calculus.', date: '1 day ago' },
      { id: 'r6', studentName: 'Riley', rating: 5, comment: 'So patient and explains things multiple ways until you get it.', date: '4 days ago' },
    ],
  },
  {
    id: '4',
    name: 'Michael',
    subject: 'Chemistry',
    expertise: 'Organic Chemistry',
    bio: 'Organic chem doesn\'t have to be scary—I\'ll show you the patterns that make it predictable.',
    rating: 4.7,
    sessionsCompleted: 41,
    avatarColor: avatarColors[8],
    category: 'stem',
    available: false,
    availableIn: 'Tomorrow 9am',
    responseTime: 'Usually responds in 30 min',
    reviews: [
      { id: 'r7', studentName: 'Jamie', rating: 5, comment: 'Michael\'s reaction mechanism tricks are lifesavers!', date: '5 days ago' },
      { id: 'r8', studentName: 'Drew', rating: 4, comment: 'Really helped me understand stereochemistry.', date: '2 weeks ago' },
    ],
  },
  {
    id: '5',
    name: 'Emma',
    subject: 'Biology',
    expertise: 'Cell Biology & Genetics',
    bio: 'I use diagrams and analogies to make biology memorable, not just memorizable.',
    rating: 4.9,
    sessionsCompleted: 47,
    avatarColor: avatarColors[2],
    category: 'stem',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 10 min',
    reviews: [
      { id: 'r9', studentName: 'Sam', rating: 5, comment: 'Emma\'s cell diagrams are incredible. Finally understand mitosis!', date: '2 days ago' },
      { id: 'r10', studentName: 'Chris', rating: 5, comment: 'Makes genetics fun with real examples.', date: '1 week ago' },
    ],
  },
  {
    id: '6',
    name: 'David',
    subject: 'Computer Science',
    expertise: 'Algorithms & Data Structures',
    bio: 'I teach coding through building real projects, not just reading textbooks.',
    rating: 4.8,
    sessionsCompleted: 39,
    avatarColor: avatarColors[7],
    category: 'stem',
    available: true,
    availableIn: 'In 2 hours',
    responseTime: 'Usually responds in 5 min',
    reviews: [
      { id: 'r11', studentName: 'Pat', rating: 5, comment: 'David helped me ace my coding interview!', date: '3 days ago' },
      { id: 'r12', studentName: 'Quinn', rating: 4, comment: 'Great at explaining Big O notation.', date: '1 week ago' },
    ],
  },
  {
    id: '7',
    name: 'Olivia',
    subject: 'English Literature',
    expertise: 'Essay Writing & Analysis',
    bio: 'I help you find your voice and build arguments that make professors take notice.',
    rating: 4.9,
    sessionsCompleted: 43,
    avatarColor: avatarColors[1],
    category: 'languages',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 15 min',
    reviews: [
      { id: 'r13', studentName: 'Robin', rating: 5, comment: 'Olivia transformed my essay writing completely.', date: '4 days ago' },
      { id: 'r14', studentName: 'Avery', rating: 5, comment: 'Her Shakespeare analysis tips are gold.', date: '1 week ago' },
    ],
  },
  {
    id: '8',
    name: 'Daniel',
    subject: 'History',
    expertise: 'World History & Research',
    bio: 'I bring history to life with stories and connections you won\'t find in textbooks.',
    rating: 4.6,
    sessionsCompleted: 35,
    avatarColor: avatarColors[9],
    category: 'social',
    available: false,
    availableIn: 'Tomorrow 2pm',
    responseTime: 'Usually responds in 20 min',
    reviews: [
      { id: 'r15', studentName: 'Skylar', rating: 5, comment: 'Daniel makes history feel like a story, not dates to memorize.', date: '6 days ago' },
      { id: 'r16', studentName: 'Charlie', rating: 4, comment: 'Great help with research papers.', date: '2 weeks ago' },
    ],
  },
  {
    id: '9',
    name: 'Sophia',
    subject: 'Spanish',
    expertise: 'Conversational Spanish',
    bio: 'Native speaker focused on getting you speaking confidently from day one.',
    rating: 5.0,
    sessionsCompleted: 48,
    avatarColor: avatarColors[3],
    category: 'languages',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 10 min',
    reviews: [
      { id: 'r17', studentName: 'Dakota', rating: 5, comment: 'Sophia is so encouraging! I\'m actually speaking Spanish now.', date: '1 day ago' },
      { id: 'r18', studentName: 'Jesse', rating: 5, comment: 'Best Spanish tutor ever. Makes it fun!', date: '5 days ago' },
    ],
  },
  {
    id: '10',
    name: 'Matthew',
    subject: 'French',
    expertise: 'Grammar & Pronunciation',
    bio: 'I focus on accent and flow so you sound natural, not like a textbook.',
    rating: 4.7,
    sessionsCompleted: 36,
    avatarColor: avatarColors[0],
    category: 'languages',
    available: true,
    availableIn: 'In 3 hours',
    responseTime: 'Usually responds in 20 min',
    reviews: [
      { id: 'r19', studentName: 'Finley', rating: 5, comment: 'Matthew fixed my pronunciation issues in just a few sessions.', date: '1 week ago' },
      { id: 'r20', studentName: 'Reese', rating: 4, comment: 'Patient and great with grammar explanations.', date: '2 weeks ago' },
    ],
  },
  {
    id: '11',
    name: 'Isabella',
    subject: 'Art',
    expertise: 'Drawing & Color Theory',
    bio: 'I help you develop your unique style while building strong fundamentals.',
    rating: 4.8,
    sessionsCompleted: 40,
    avatarColor: avatarColors[6],
    category: 'arts',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 15 min',
    reviews: [
      { id: 'r21', studentName: 'Emerson', rating: 5, comment: 'Isabella\'s color theory lessons changed how I see art.', date: '3 days ago' },
      { id: 'r22', studentName: 'Hayden', rating: 5, comment: 'So supportive and gives actionable feedback.', date: '1 week ago' },
    ],
  },
  {
    id: '12',
    name: 'Christopher',
    subject: 'Geography',
    expertise: 'Physical & Human Geography',
    bio: 'I connect geography to global issues so you see why place matters.',
    rating: 4.9,
    sessionsCompleted: 44,
    avatarColor: avatarColors[2],
    category: 'social',
    available: true,
    availableIn: 'In 1 hour',
    responseTime: 'Usually responds in 10 min',
    reviews: [
      { id: 'r23', studentName: 'Blake', rating: 5, comment: 'Christopher makes geography relevant and interesting.', date: '2 days ago' },
      { id: 'r24', studentName: 'Cameron', rating: 5, comment: 'Great at explaining climate patterns.', date: '1 week ago' },
    ],
  },
  {
    id: '13',
    name: 'Ava',
    subject: 'Psychology',
    expertise: 'Cognitive Psychology',
    bio: 'I use real experiments and case studies to make psych concepts stick.',
    rating: 4.7,
    sessionsCompleted: 37,
    avatarColor: avatarColors[1],
    category: 'social',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 15 min',
    reviews: [
      { id: 'r25', studentName: 'Peyton', rating: 5, comment: 'Ava explains theories with fascinating real-world examples.', date: '4 days ago' },
      { id: 'r26', studentName: 'Kendall', rating: 4, comment: 'Helped me understand research methods finally.', date: '2 weeks ago' },
    ],
  },
  {
    id: '14',
    name: 'Andrew',
    subject: 'Statistics',
    expertise: 'Statistical Analysis & R',
    bio: 'I demystify stats by focusing on intuition before formulas.',
    rating: 4.8,
    sessionsCompleted: 42,
    avatarColor: avatarColors[5],
    category: 'stem',
    available: false,
    availableIn: 'Tomorrow 11am',
    responseTime: 'Usually responds in 30 min',
    reviews: [
      { id: 'r27', studentName: 'Logan', rating: 5, comment: 'Andrew made hypothesis testing actually make sense.', date: '5 days ago' },
      { id: 'r28', studentName: 'Parker', rating: 4, comment: 'Great with R programming help too.', date: '1 week ago' },
    ],
  },
  {
    id: '15',
    name: 'Mia',
    subject: 'Music Theory',
    expertise: 'Harmony & Composition',
    bio: 'I teach theory through songs you love so it feels relevant, not abstract.',
    rating: 4.9,
    sessionsCompleted: 46,
    avatarColor: avatarColors[3],
    category: 'arts',
    available: true,
    availableIn: 'In 30 min',
    responseTime: 'Usually responds in 5 min',
    reviews: [
      { id: 'r29', studentName: 'Spencer', rating: 5, comment: 'Mia made music theory fun! Love analyzing pop songs.', date: '2 days ago' },
      { id: 'r30', studentName: 'Addison', rating: 5, comment: 'Finally understand chord progressions thanks to Mia.', date: '1 week ago' },
    ],
  },
  {
    id: '16',
    name: 'Joshua',
    subject: 'Philosophy',
    expertise: 'Ethics & Logic',
    bio: 'I guide discussions that challenge your thinking without making you feel lost.',
    rating: 4.6,
    sessionsCompleted: 33,
    avatarColor: avatarColors[7],
    category: 'social',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 20 min',
    reviews: [
      { id: 'r31', studentName: 'Harper', rating: 5, comment: 'Joshua\'s Socratic method really makes you think deeply.', date: '6 days ago' },
      { id: 'r32', studentName: 'Bailey', rating: 4, comment: 'Great at explaining formal logic.', date: '2 weeks ago' },
    ],
  },
  {
    id: '17',
    name: 'Charlotte',
    subject: 'Environmental Science',
    expertise: 'Ecology & Sustainability',
    bio: 'I make environmental science tangible with local examples and hands-on thinking.',
    rating: 4.8,
    sessionsCompleted: 41,
    avatarColor: avatarColors[8],
    category: 'stem',
    available: true,
    availableIn: 'In 2 hours',
    responseTime: 'Usually responds in 15 min',
    reviews: [
      { id: 'r33', studentName: 'River', rating: 5, comment: 'Charlotte connects everything to real environmental issues.', date: '3 days ago' },
      { id: 'r34', studentName: 'Sage', rating: 5, comment: 'Her ecosystem explanations are so clear.', date: '1 week ago' },
    ],
  },
  {
    id: '18',
    name: 'Ryan',
    subject: 'Business Studies',
    expertise: 'Marketing & Strategy',
    bio: 'I use real company case studies so you see business theory in action.',
    rating: 4.7,
    sessionsCompleted: 38,
    avatarColor: avatarColors[4],
    category: 'social',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 10 min',
    reviews: [
      { id: 'r35', studentName: 'Reed', rating: 5, comment: 'Ryan\'s case study approach makes everything click.', date: '4 days ago' },
      { id: 'r36', studentName: 'Rowan', rating: 4, comment: 'Great help with my business plan project.', date: '2 weeks ago' },
    ],
  },
  {
    id: '19',
    name: 'Amelia',
    subject: 'Latin',
    expertise: 'Classical Latin & Translation',
    bio: 'I make ancient texts accessible with cultural context and translation strategies.',
    rating: 4.9,
    sessionsCompleted: 45,
    avatarColor: avatarColors[9],
    category: 'languages',
    available: true,
    availableIn: 'In 1 hour',
    responseTime: 'Usually responds in 15 min',
    reviews: [
      { id: 'r37', studentName: 'Phoenix', rating: 5, comment: 'Amelia makes Virgil actually enjoyable to read.', date: '2 days ago' },
      { id: 'r38', studentName: 'Kai', rating: 5, comment: 'Her grammar tricks saved my Latin grade.', date: '1 week ago' },
    ],
  },
  {
    id: '20',
    name: 'Nathan',
    subject: 'Engineering',
    expertise: 'Mechanical Engineering',
    bio: 'I break down engineering problems step-by-step so nothing feels overwhelming.',
    rating: 4.8,
    sessionsCompleted: 40,
    avatarColor: avatarColors[0],
    category: 'stem',
    available: true,
    availableIn: 'Available now',
    responseTime: 'Usually responds in 10 min',
    reviews: [
      { id: 'r39', studentName: 'Ellis', rating: 5, comment: 'Nathan\'s problem-solving approach is methodical and clear.', date: '5 days ago' },
      { id: 'r40', studentName: 'Lennox', rating: 4, comment: 'Really helpful with statics and dynamics.', date: '1 week ago' },
    ],
  },
];

// Helper to get tutor initials
export const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

// Get popular subjects based on total sessions
export const getPopularSubjects = () => {
  const subjectSessions: Record<string, number> = {};
  tutors.forEach(t => {
    subjectSessions[t.subject] = (subjectSessions[t.subject] || 0) + t.sessionsCompleted;
  });
  return Object.entries(subjectSessions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([subject]) => subject);
};
