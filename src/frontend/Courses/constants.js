/* ═══════════════════════════PALETTE — same as AdminLanding═══════════════════════════ */
export const C = {
  bg: "#020407",
  b1: "#06090f",
  b2: "#0a0f1a",
  v: "#7c3aff",
  v2: "#9d6bff",
  vD: "#4a1fa8",
  c: "#00e5ff",
  c2: "#66f4ff",
  g: "#00ff88",
  gD: "#00b360",
  r: "#ff3366",
  r2: "#ff6688",
  am: "#ffaa00",
  am2: "#ffc844",
  text: "#dce8ff",
  t2: "#5a6f8a",
  t3: "#1e2d40",
  bord: "rgba(255,255,255,0.06)",
};

export const GR = {
  v: "linear-gradient(135deg,#7c3aff,#00e5ff)",
  cg: "linear-gradient(135deg,#00e5ff,#00ff88)",
  am: "linear-gradient(135deg,#ffaa00,#ff3366)",
  vr: "linear-gradient(135deg,#9d6bff,#ff3366)",
  rg: "linear-gradient(135deg,#ff3366,#ffaa00)",
};

/* ═══════════════════════════MOCK DATA═══════════════════════ */
export const CATS = [
  { id: 'all', label: 'All Courses', count: 84 },
  { id: 'dev', label: 'Development', count: 28 },
  { id: 'design', label: 'Design', count: 16 },
  { id: 'data', label: 'Data Science', count: 19 },
  { id: 'business', label: 'Business', count: 12 },
  { id: 'cloud', label: 'Cloud & DevOps', count: 9 },
];

export const COURSES = [
  {
    id: 1,
    title: 'AWS Solutions Architect',
    cat: 'Cloud & DevOps',
    catId: 'cloud',
    instructor: 'Vikram Iyer',
    emoji: '☁️',
    bg: 'linear-gradient(135deg,#1a0533,#0a1a2e)',
    col: C.v,
    students: 4820,
    lessons: 86,
    duration: '42h',
    rating: 4.9,
    price: 4999,
    revenue: '₹2.4L',
    status: 'published',
    progress: 100,
    tags: ['AWS', 'Cloud', 'DevOps'],
    enrolled: true
  },
  {
    id: 2,
    title: 'Machine Learning A–Z',
    cat: 'Data Science',
    catId: 'data',
    instructor: 'Dr. Priya Nair',
    emoji: '🤖',
    bg: 'linear-gradient(135deg,#0a1a33,#001a0a)',
    col: C.c,
    students: 6240,
    lessons: 124,
    duration: '58h',
    rating: 4.8,
    price: 5999,
    revenue: '₹3.7L',
    status: 'published',
    progress: 100,
    tags: ['Python', 'ML', 'AI'],
    enrolled: true
  },
  {
    id: 3,
    title: 'UI/UX Design Mastery',
    cat: 'Design',
    catId: 'design',
    instructor: 'Sneha Kulkarni',
    emoji: '🎨',
    bg: 'linear-gradient(135deg,#1a1a00,#2a0a1a)',
    col: C.am,
    students: 3180,
    lessons: 64,
    duration: '30h',
    rating: 4.7,
    price: 3499,
    revenue: '₹1.1L',
    status: 'published',
    progress: 100,
    tags: ['Figma', 'Design', 'UX'],
    enrolled: false
  },
  {
    id: 4,
    title: 'React & Next.js Pro',
    cat: 'Development',
    catId: 'dev',
    instructor: 'Arjun Mehta',
    emoji: '⚛️',
    bg: 'linear-gradient(135deg,#001a33,#0a001a)',
    col: C.c,
    students: 5120,
    lessons: 96,
    duration: '48h',
    rating: 4.9,
    price: 4499,
    revenue: '₹2.3L',
    status: 'published',
    progress: 100,
    tags: ['React', 'Next.js', 'TypeScript'],
    enrolled: false
  },
  {
    id: 5,
    title: 'Python for Beginners',
    cat: 'Development',
    catId: 'dev',
    instructor: 'Riya Sharma',
    emoji: '🐍',
    bg: 'linear-gradient(135deg,#001a0a,#1a1a00)',
    col: C.g,
    students: 892,
    lessons: 42,
    duration: '18h',
    rating: 4.6,
    price: 0,
    revenue: '—',
    status: 'draft',
    progress: 65,
    tags: ['Python', 'Beginner'],
    enrolled: false
  },
  {
    id: 6,
    title: 'Digital Marketing 2026',
    cat: 'Business',
    catId: 'business',
    instructor: 'Karan Malhotra',
    emoji: '📱',
    bg: 'linear-gradient(135deg,#1a0a00,#1a001a)',
    col: C.am,
    students: 0,
    lessons: 28,
    duration: '14h',
    rating: 0,
    price: 2999,
    revenue: '—',
    status: 'review',
    progress: 88,
    tags: ['Marketing', 'SEO', 'Social'],
    enrolled: false
  },
  {
    id: 7,
    title: 'Kubernetes & Docker',
    cat: 'Cloud & DevOps',
    catId: 'cloud',
    instructor: 'Suresh Patel',
    emoji: '🐳',
    bg: 'linear-gradient(135deg,#00101a,#001a10)',
    col: C.c,
    students: 2240,
    lessons: 72,
    duration: '36h',
    rating: 4.8,
    price: 5499,
    revenue: '₹1.2L',
    status: 'published',
    progress: 100,
    tags: ['K8s', 'Docker', 'DevOps'],
    enrolled: true
  },
  {
    id: 8,
    title: 'Figma Advanced Prototyping',
    cat: 'Design',
    catId: 'design',
    instructor: 'Ananya Roy',
    emoji: '✏️',
    bg: 'linear-gradient(135deg,#1a0a1a,#1a1a00)',
    col: C.v2,
    students: 1640,
    lessons: 52,
    duration: '24h',
    rating: 4.7,
    price: 3999,
    revenue: '₹65K',
    status: 'published',
    progress: 100,
    tags: ['Figma', 'Prototyping'],
    enrolled: false
  },
  {
    id: 9,
    title: 'Data Engineering Bootcamp',
    cat: 'Data Science',
    catId: 'data',
    instructor: 'Dr. Priya Nair',
    emoji: '🏗️',
    bg: 'linear-gradient(135deg,#000a1a,#1a000a)',
    col: C.r,
    students: 0,
    lessons: 0,
    duration: '—',
    rating: 0,
    price: 6999,
    revenue: '—',
    status: 'archived',
    progress: 100,
    tags: ['Spark', 'Kafka', 'ETL'],
    enrolled: false
  },
];

export const STATUS_MAP = {
  published: { label: 'Published', cls: 'badge-published', dot: C.g },
  draft: { label: 'Draft', cls: 'badge-draft', dot: C.t2 },
  review: { label: 'In Review', cls: 'badge-review', dot: C.am },
  archived: { label: 'Archived', cls: 'badge-archived', dot: C.r },
};

export const BUILDER_STEPS = ['Basic Info', 'Curriculum', 'Media', 'Pricing', 'Publish'];

export const TYPE_ICONS = {
  video: '▶',
  doc: '📄',
  quiz: '❓',
  assignment: '📝',
  live: '🔴'
};

export const TYPE_COLORS = {
  video: C.v,
  doc: C.c,
  quiz: C.am,
  assignment: C.g,
  live: C.r
};

export const defaultSections = [
  {
    id: 1,
    title: 'Getting Started',
    open: true,
    lessons: [
      { id: 1, type: 'video', title: 'Welcome & Course Overview', dur: '5:30', free: true },
      { id: 2, type: 'doc', title: 'Course Resources & Downloads', dur: '—', free: true },
    ]
  },
  {
    id: 2,
    title: 'Core Concepts',
    open: false,
    lessons: [
      { id: 3, type: 'video', title: 'Introduction to the Framework', dur: '12:45', free: false },
      { id: 4, type: 'quiz', title: 'Module 1 Quiz', dur: '10 Qs', free: false },
      { id: 5, type: 'video', title: 'Deep Dive: Architecture Patterns', dur: '22:10', free: false },
    ]
  },
  {
    id: 3,
    title: 'Advanced Topics',
    open: false,
    lessons: [
      { id: 6, type: 'video', title: 'Performance Optimization', dur: '18:30', free: false },
      { id: 7, type: 'assignment', title: 'Build a Real-World Project', dur: 'Proj', free: false },
    ]
  },
];

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', ico: '⬡', label: 'Dashboard' },
  { id: 'courses', ico: '📚', label: 'Courses', badge: 84, badgeCol: C.v },
  { id: 'builder', ico: '🔨', label: 'Course Builder' },
  { id: 'students', ico: '👥', label: 'Students', badge: '52K', badgeCol: C.c },
  { id: 'revenue', ico: '💰', label: 'Revenue' },
  { id: 'analytics', ico: '📊', label: 'Analytics' },
  { id: 'settings', ico: '⚙', label: 'Settings' },
];
