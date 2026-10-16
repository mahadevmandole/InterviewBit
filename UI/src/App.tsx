import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import DashboardSectionPage from './pages/DashboardSectionPage/DashboardSectionPage';
import SignInPage from './pages/SignInPage/SignInPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import QuestionPage from './pages/QuestionPage/QuestionPage';
import { hasSession } from './features/auth/authService';
import DashboardLayout from './components/organisms/DashboardLayout/DashboardLayout';

function RequireSession({ children }: { children: ReactNode }) {
  return hasSession() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        element={
          <RequireSession>
            <DashboardLayout />
          </RequireSession>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/:section" element={<DashboardSectionPage />} />
        <Route path="/practice/:technologyId" element={<QuestionPage />} />
      </Route>
      <Route path="/" element={<Navigate to={hasSession() ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
