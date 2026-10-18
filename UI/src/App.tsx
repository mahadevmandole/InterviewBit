import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import DashboardSectionPage from './pages/DashboardSectionPage/DashboardSectionPage';
import SignInPage from './pages/SignInPage/SignInPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import QuestionPage from './pages/QuestionPage/QuestionPage';
import TestCompletedPage from './pages/TestCompletedPage/TestCompletedPage';
import InterviewHistoryDetailPage from './pages/InterviewHistoryDetailPage/InterviewHistoryDetailPage';
import { hasSession } from './features/auth/authService';
import DashboardLayout from './components/organisms/DashboardLayout/DashboardLayout';
import { type ToastType } from './lib/toast';

type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

function RequireSession({ children }: { children: ReactNode }) {
  return hasSession() ? children : <Navigate to="/login" replace />;
}

function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; type: ToastType }>).detail;
      if (!detail?.message) return;

      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message: detail.message, type: detail.type ?? 'info' }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4000);
    };

    window.addEventListener('app:toast', handleToast);
    return () => window.removeEventListener('app:toast', handleToast);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        right: '1rem',
        top: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          style={{
            minWidth: '260px',
            maxWidth: '360px',
            background: toast.type === 'error' ? '#b91c1c' : toast.type === 'success' ? '#15803d' : '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <>
      <ToastContainer />
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
          <Route path="/dashboard/history/:sessionId" element={<InterviewHistoryDetailPage />} />
          <Route path="/practice/:technologyId" element={<QuestionPage />} />
          <Route path="/practice/:technologyId/completed" element={<TestCompletedPage />} />
        </Route>
        <Route path="/" element={<Navigate to={hasSession() ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
