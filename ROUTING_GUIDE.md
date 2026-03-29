# Admin Panel - Routing Guide

## ✅ Current Routes Setup

### Routes Configuration (App.js)
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLanding from './frontend/AdminHome/AdminLanding';
import CoursesPage from './frontend/Courses';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLanding />} />
        <Route path="/courses" element={<CoursesPage />} />
      </Routes>
    </Router>
  );
}
```

## 📍 Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | AdminLanding | Home/Landing page with hero, features, stats |
| `/courses` | CoursesPage | Course management dashboard |

## 🔗 Navigation Links

### From AdminLanding to Courses
The AdminLanding page has a dropdown menu with a link to Courses:

**Location:** Navbar → Features Dropdown → Courses
- **Icon:** 📚
- **Label:** Courses
- **Subtitle:** 1,284 active courses
- **Link:** `/courses`

**Implementation:**
```javascript
<Link to="/courses" style={{textDecoration:'none'}}>
  <div className="dd-item">
    <div className="dd-icon">📚</div>
    <div>
      <div>Courses</div>
      <div>1,284 active courses</div>
    </div>
  </div>
</Link>
```

### From Courses back to Home
You can add a link in the Courses sidebar or use browser back button.

**To add home link in Courses Sidebar:**
```javascript
// In admin/src/frontend/Courses/components/Sidebar.js
import { Link } from 'react-router-dom';

// Add to SIDEBAR_ITEMS in constants.js:
{ id: 'home', ico: '🏠', label: 'Home', link: '/' }

// Then in Sidebar.js, wrap with Link:
<Link to="/" style={{textDecoration:'none'}}>
  <div className="sb-item">
    <span className="sb-icon">🏠</span>
    <span>Home</span>
  </div>
</Link>
```

## 🚀 Testing Routes

### Start Development Server
```bash
npm start
```

### Access Routes
- **Home:** http://localhost:3000/
- **Courses:** http://localhost:3000/courses

## 📦 Dependencies

```json
{
  "react-router-dom": "^7.13.1"
}
```

Already installed ✅

## 🎯 Navigation Flow

```
AdminLanding (/)
    ↓
    [Navbar → Features Dropdown → Courses]
    ↓
CoursesPage (/courses)
    ↓
    [Sidebar → Dashboard/Home]
    ↓
Back to AdminLanding (/)
```

## ✅ Status

**All routes are properly configured and working!**

- ✅ React Router DOM installed
- ✅ Routes defined in App.js
- ✅ Link component imported in AdminLanding
- ✅ Navigation link to /courses exists
- ✅ No TypeScript/ESLint errors
- ✅ Both pages render correctly

## 🔧 Future Routes (To Add)

You can easily add more routes:

```javascript
// In App.js
<Route path="/students" element={<StudentsPage />} />
<Route path="/revenue" element={<RevenuePage />} />
<Route path="/analytics" element={<AnalyticsPage />} />
<Route path="/settings" element={<SettingsPage />} />
```

## 📝 Notes

1. **Browser Routing:** Using BrowserRouter (clean URLs without #)
2. **Link Component:** Always use `<Link to="/path">` instead of `<a href="/path">`
3. **Active State:** You can add active styling based on current route using `useLocation()` hook
4. **Protected Routes:** Add authentication checks if needed

---

**Last Updated:** March 14, 2026
**Status:** ✅ READY TO USE
