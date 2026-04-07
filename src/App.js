import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLanding    from './frontend/AdminHome/AdminLanding';
import CoursesPage     from './frontend/Courses';
import SettingsPage    from './frontend/Settings/SettingsPage';
import StudentsPage    from './frontend/Students';
import RevenuePage     from './frontend/Revenue';
import AuthPage        from './frontend/Auth/AuthPage';
import AssignmentsPage from './frontend/Assignments/AssignmentsPage';
import AnalyticsPage  from './frontend/Analytics/AnalyticsPage';
import GoogleCallback  from './frontend/Auth/GoogleCallback';
import StatusPage        from './frontend/Status/StatusPage';
import InstructorsPage  from './frontend/Instructors';
import ModerationPage   from './frontend/Moderation';
import { authService } from './frontend/Auth/services/authService';

import { Component } from 'react';

class RouteErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#050814', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ede8ff', fontFamily: 'DM Mono,monospace', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <div>Page load error — <a href="/" style={{ color: '#7c2fff' }}>Go Home</a></div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  if (!authService.isLoggedIn()) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// Routes only super_admin can access
function SuperAdminRoute({ children }) {
  if (!authService.isLoggedIn()) return <Navigate to="/auth" replace />;
  if (!authService.isSuperAdmin()) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/google-callback" element={<GoogleCallback />} />
          <Route path="/status"              element={<ProtectedRoute><StatusPage /></ProtectedRoute>} />

          {/* Protected - Admin */}
          <Route path="/"            element={<ProtectedRoute><AdminLanding /></ProtectedRoute>} />
          <Route path="/courses"     element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
          <Route path="/students"    element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/revenue"     element={<SuperAdminRoute><RevenuePage /></SuperAdminRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
          <Route path="/analytics"   element={<SuperAdminRoute><AnalyticsPage /></SuperAdminRoute>} />
          <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/instructors" element={<SuperAdminRoute><RouteErrorBoundary><InstructorsPage /></RouteErrorBoundary></SuperAdminRoute>} />
          <Route path="/moderation"  element={<SuperAdminRoute><ModerationPage /></SuperAdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={authService.isLoggedIn() ? '/' : '/auth'} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
