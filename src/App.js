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
import StatusPage      from './frontend/Status/StatusPage';
import { authService } from './frontend/Auth/services/authService';

function ProtectedRoute({ children }) {
  if (!authService.isLoggedIn()) {
    return <Navigate to="/auth" replace />;
  }
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
          <Route path="/revenue"     element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
          <Route path="/analytics"   element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
