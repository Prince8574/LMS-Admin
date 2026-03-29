# Admin Panel Routing Setup

## Overview
Admin panel mein React Router DOM ka use karke routing setup ki gayi hai.

## Routes

### Main Routes
- `/` - Admin Landing Page (Home)
- `/courses` - Courses Management Page

## Navigation

### Landing Page se Courses tak
1. Admin Landing page par navbar mein "Features" dropdown click karein
2. "Platform Modules" section mein "📚 Courses" option par click karein
3. Automatically `/courses` route par navigate ho jayega

## Technical Details

### Dependencies
- `react-router-dom` - Routing library

### Files Modified
1. **admin/src/App.js**
   - BrowserRouter, Routes, Route import kiya
   - Routes setup kiya for `/` and `/courses`

2. **admin/src/frontend/AdminHome/AdminLanding.js**
   - Link component import kiya
   - Courses dropdown item ko Link se wrap kiya
   - `/courses` route add kiya

### Code Structure
```javascript
// App.js
<Router>
  <Routes>
    <Route path="/" element={<AdminLanding />} />
    <Route path="/courses" element={<Courses />} />
  </Routes>
</Router>

// AdminLanding.js
<Link to="/courses">
  <div className="dd-item">
    📚 Courses
  </div>
</Link>
```

## Testing
1. Admin panel start karein: `npm start`
2. Browser mein `http://localhost:3000` open karein
3. Navbar mein Features dropdown se Courses par click karein
4. Courses page load hona chahiye

## Future Routes
Aage aur routes add kar sakte hain:
- `/analytics` - Analytics Dashboard
- `/users` - User Management
- `/revenue` - Revenue & Billing
- `/settings` - Admin Settings
