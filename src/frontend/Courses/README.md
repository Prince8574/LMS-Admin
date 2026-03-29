# Courses Management System

Complete admin panel for managing online courses with a modern, animated UI.

## 📁 Folder Structure

```
Courses/
├── components/
│   ├── Sidebar.js              # Left navigation sidebar
│   ├── CourseCard.js           # Course card component (grid view)
│   ├── CourseBuilder.js        # Multi-step course creation modal
│   ├── CurriculumBuilder.js    # Curriculum editor with sections/lessons
│   └── Stars.js                # Rating stars component
├── CoursesPage.js              # Main page component
├── Courses.css                 # Complete styling & animations
├── constants.js                # Colors, data, config
└── README.md                   # This file
```

## 🎨 Features

### Course Management
- **Grid & List Views** - Toggle between card grid and table list
- **Advanced Filtering** - By category, status, search query
- **Sorting** - By students, rating, revenue, newest
- **Status Tracking** - Published, Draft, In Review, Archived
- **Real-time Stats** - Total courses, enrollments, revenue

### Course Builder (5-Step Wizard)
1. **Basic Info** - Title, description, category, level, skills
2. **Curriculum** - Sections, lessons (video, doc, quiz, assignment, live)
3. **Media** - Thumbnail, promo video, content type
4. **Pricing** - Free, Paid, or Subscription model
5. **Publish** - Review checklist and publish

### UI/UX
- **Smooth Animations** - Fade, slide, scale effects
- **Glassmorphism** - Modern frosted glass effects
- **Neon Accents** - Violet & cyan gradient theme
- **Responsive** - Works on all screen sizes
- **Toast Notifications** - Success/error messages
- **Drag & Drop** - Reorder curriculum items

## 🎯 Components

### CoursesPage (Main)
Main container with sidebar, topbar, stats, filters, and course grid/list.

**State:**
- `activeCat` - Selected category filter
- `statusFilter` - Selected status filter
- `viewMode` - 'grid' or 'list'
- `searchQuery` - Search input value
- `sortBy` - Sort criteria
- `showBuilder` - Builder modal visibility
- `editingCourse` - Course being edited
- `toast` - Toast message
- `activeSidebar` - Active sidebar item

### CourseCard
Individual course card with thumbnail, metadata, progress, actions.

**Props:**
- `course` - Course object
- `onEdit` - Edit callback
- `onView` - Preview callback
- `delay` - Animation delay

### CourseBuilder
Multi-step modal for creating/editing courses.

**Props:**
- `onClose` - Close callback
- `editCourse` - Course to edit (optional)

**Steps:**
1. Basic Info
2. Curriculum
3. Media
4. Pricing
5. Publish

### CurriculumBuilder
Nested component for building course curriculum.

**Props:**
- `sections` - Array of sections
- `setSections` - Update sections

**Features:**
- Add/delete sections
- Add/delete lessons
- Toggle section expand/collapse
- Lesson types: video, doc, quiz, assignment, live

### Sidebar
Left navigation with logo, menu items, user profile.

**Props:**
- `activeSidebar` - Active menu item
- `setActiveSidebar` - Update active item
- `onBuilderOpen` - Open builder callback

### Stars
Rating stars display component.

**Props:**
- `n` - Number of stars (default: 5)
- `val` - Rating value (default: 4.8)

## 🎨 Design System

### Colors (from constants.js)
```javascript
C = {
  bg: "#020407",      // Background
  v: "#7c3aff",       // Violet (primary)
  c: "#00e5ff",       // Cyan (secondary)
  g: "#00ff88",       // Green (success)
  r: "#ff3366",       // Red (danger)
  am: "#ffaa00",      // Amber (warning)
  text: "#dce8ff",    // Text
  t2: "#5a6f8a",      // Text secondary
  t3: "#1e2d40",      // Text tertiary
}
```

### Gradients
```javascript
GR = {
  v: "linear-gradient(135deg,#7c3aff,#00e5ff)",
  cg: "linear-gradient(135deg,#00e5ff,#00ff88)",
  am: "linear-gradient(135deg,#ffaa00,#ff3366)",
}
```

### Typography
- **Headings**: Clash Display (bold, tight spacing)
- **Body**: Outfit (clean, readable)
- **Code/Data**: DM Mono (monospace)

## 📊 Data Structure

### Course Object
```javascript
{
  id: 1,
  title: 'Course Title',
  cat: 'Category Name',
  catId: 'category-id',
  instructor: 'Instructor Name',
  emoji: '📚',
  bg: 'linear-gradient(...)',
  col: '#7c3aff',
  students: 4820,
  lessons: 86,
  duration: '42h',
  rating: 4.9,
  price: 4999,
  revenue: '₹2.4L',
  status: 'published',
  progress: 100,
  tags: ['Tag1', 'Tag2'],
  enrolled: true
}
```

### Status Types
- `published` - Live and available
- `draft` - Work in progress
- `review` - Pending approval
- `archived` - Removed from catalog

## 🚀 Usage

```javascript
import CoursesPage from './frontend/Courses/CoursesPage';

function App() {
  return <CoursesPage />;
}
```

## 🎬 Animations

All animations defined in `Courses.css`:
- `fadeUp` - Fade in from bottom
- `fadeIn` - Simple fade in
- `slideRight` - Slide from left
- `slideLeft` - Slide from right
- `scaleIn` - Scale up
- `dotBlink` - Pulsing dot
- `pulse` - Box shadow pulse
- `orbGlow` - Background orb animation
- `progressFill` - Progress bar fill
- `tagPop` - Tag pop-in
- `builderSlide` - Builder step transition
- `toast` - Toast notification

## 📱 Responsive

- Desktop: Full layout with sidebar
- Tablet: Adjusted grid columns
- Mobile: Single column, collapsible sidebar

## 🔧 Customization

### Change Colors
Edit `constants.js` → `C` object

### Add Course Categories
Edit `constants.js` → `CATS` array

### Modify Course Data
Edit `constants.js` → `COURSES` array

### Add Lesson Types
Edit `constants.js` → `TYPE_ICONS` and `TYPE_COLORS`

## 📦 Dependencies

```json
{
  "react": "^19.x",
  "react-dom": "^19.x"
}
```

No external UI libraries needed - pure CSS!

## ✅ Status

**READY TO USE** 🚀

All components created and organized. Import `CoursesPage` and start using!
