import { CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

function TestCompletedPage() {
  const navigate = useNavigate();
  const { technologyId = 'javascript' } = useParams();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #eef6ff, #f8f9ff)',
      color: '#0f172a',
    }}>
      <div style={{
        maxWidth: 680,
        width: '100%',
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
        padding: '2.5rem',
        textAlign: 'center',
      }}>
        <CheckCircle2 size={72} color="#16a34a" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>You successfully completed the test</h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#475569', marginBottom: '2rem' }}>
          Your {technologyId} interview has been captured and submitted for evaluation. You can return to the dashboard and continue practicing.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            border: 'none',
            borderRadius: 999,
            padding: '0.9rem 1.5rem',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default TestCompletedPage;
