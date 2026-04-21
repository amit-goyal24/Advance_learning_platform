import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Route wrappers
import { RequireAuth, RequireRole } from './components/ProtectedRoutes';
import { Toaster } from 'react-hot-toast';

// Admin Modules
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminResults from './pages/AdminResults';
import AdminStudents from './pages/AdminStudents';

// Student Modules
import StudentCourses from './pages/StudentCourses';
import StudentCourseDetail from './pages/StudentCourseDetail';
import StudentQuiz from './pages/StudentQuiz';
import StudentResults from './pages/StudentResults';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer bg-gray-50 py-12" style={{ backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div className="container text-center text-muted">
          <p>© 2024 LearnHub LMS. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Student Routes */}
          <Route element={<RequireAuth />}>
            <Route element={<RequireRole allowedRole="Student" />}>
              <Route path="/courses" element={<StudentCourses />} />
              <Route path="/courses/:id" element={<StudentCourseDetail />} />
              <Route path="/quiz/:quizId" element={<StudentQuiz />} />
              <Route path="/results" element={<StudentResults />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<RequireAuth />}>
            <Route element={<RequireRole allowedRole="Admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/quizzes" element={<AdminQuizzes />} />
              <Route path="/admin/results" element={<AdminResults />} />
              <Route path="/admin/students" element={<AdminStudents />} />
            </Route>
          </Route>
        </Routes>
      </MainLayout>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000,
          style: {
            animationDuration: '0.3s'
          }
        }} 
      />
    </Router>
  );
}

export default App;
