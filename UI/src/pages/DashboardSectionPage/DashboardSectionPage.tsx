import { ArrowRight, CalendarDays, Gauge, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchInterviewSessions } from '../../features/interviews/interviewService';
import { showToast } from '../../lib/toast';
import ApiLoader from '../../components/atoms/ApiLoader/ApiLoader';
import './DashboardSectionPage.scss';

const sectionContent: Record<string, { title: string; description: string }> = {
  history: {
    title: 'My practice',
    description: 'Your completed and in-progress interview sessions will appear here.',
  },
  progress: {
    title: 'Progress',
    description: 'Track your practice streaks and answer feedback here.',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your profile and interview preferences here.',
  },
};

function DashboardSectionPage() {
  const { section = '' } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section !== 'history') return;

    let isMounted = true;
    setLoading(true);

    fetchInterviewSessions()
      .then((result) => {
        if (isMounted) setSessions(result);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'We could not load your interview history.';
        showToast(message, 'error');
        if (isMounted) setSessions([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [section]);

  const content = sectionContent[section] ?? {
    title: 'Page not found',
    description: 'Choose another section from the navigation.',
  };

  if (section !== 'history') {
    return (
      <section className="section-placeholder">
        <span className="section-kicker">ROUNDZERO WORKSPACE</span>
        <h1 className="keyboard-heading" tabIndex={0}>
          {content.title}
        </h1>
        <p>{content.description}</p>
      </section>
    );
  }

  return (
    <section className="section-placeholder history-page">
      <div className="history-header">
        <div>
          <span className="section-kicker">ROUNDZERO WORKSPACE</span>
          <h1 className="keyboard-heading" tabIndex={0}>
            {content.title}
          </h1>
          <p>{content.description}</p>
        </div>
        <div className="history-pill">
          <ListTodo size={14} />
          {sessions.length} reports
        </div>
      </div>

      {loading ? (
        <div className="history-loading">
          <ApiLoader message="Loading your interview history…" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="history-empty-state">
          <div className="history-empty-card">
            <Gauge size={28} />
            <h3>No interview results yet</h3>
            <p>Finish a practice test to generate a personalized evaluation report.</p>
          </div>
        </div>
      ) : (
        <div className="history-list">
          {sessions.map((session) => {
            const sessionId = String(session._id ?? '');
            const technology = String(session.technology_id ?? 'Unknown');
            const submittedAt = String(session.submitted_at ?? '');
            const questionCount = Array.isArray(session.questions) ? session.questions.length : 0;
            const averageScore = Array.isArray(session.questions)
              ? Math.round(
                  (session.questions as Array<Record<string, unknown>>).reduce((total, item) => {
                    const evaluation = item.evaluation as Record<string, unknown> | undefined;
                    const score = Number(evaluation?.overall_score ?? 0);
                    return total + score;
                  }, 0) / Math.max((session.questions as Array<Record<string, unknown>>).length, 1),
                )
              : 0;

            return (
              <article key={sessionId} className="history-card">
                <div className="history-card__meta">
                  <div className="history-card__icon">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h3>{technology}</h3>
                    <p>{submittedAt ? new Date(submittedAt).toLocaleString() : 'Submitted'}</p>
                  </div>
                </div>

                <div className="history-card__details">
                  <span>{questionCount} questions</span>
                  <span>Avg score: {averageScore}/100</span>
                </div>

                <button
                  type="button"
                  className="history-card__button"
                  onClick={() => navigate(`/dashboard/history/${sessionId}`)}
                >
                  View result
                  <ArrowRight size={14} />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default DashboardSectionPage;
