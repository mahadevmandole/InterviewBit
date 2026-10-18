import { ArrowLeft, CheckCircle2, MessageSquareText, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchInterviewSession } from '../../features/interviews/interviewService';
import { showToast } from '../../lib/toast';
import ApiLoader from '../../components/atoms/ApiLoader/ApiLoader';
import './InterviewHistoryDetailPage.scss';

function InterviewHistoryDetailPage() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchInterviewSession(sessionId)
      .then((result) => {
        if (isMounted) {
          setSession(result);
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'We could not load this interview result.';
        showToast(message, 'error');
        if (isMounted) {
          setSession(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const aggregate = useMemo(() => {
    const list = Array.isArray(session?.questions) ? (session.questions as Array<Record<string, unknown>>) : [];
    if (!list.length) {
      return { average: 0, passed: 0, feedback: 'No evaluation available yet.' };
    }

    const scores = list.map((item) => Number((item.evaluation as Record<string, unknown> | undefined)?.overall_score ?? 0));
    const average = Math.round(scores.reduce((total, value) => total + value, 0) / scores.length);
    const weak = list.filter((item) => Number((item.evaluation as Record<string, unknown> | undefined)?.overall_score ?? 0) < 60).length;
    const feedback = weak
      ? 'Improve the answer structure, explain the technical reasoning more deeply, and cover the must-have keywords from the question.'
      : 'Strong interview performance. Continue to sharpen examples and show clearer trade-off reasoning.';

    return { average, passed: list.length - weak, feedback };
  }, [session]);

  if (loading) {
    return <div className="loading-state"><ApiLoader message="Loading interview evaluation…" /></div>;
  }

  if (!session) {
    return (
      <div className="empty-state">
        <div className="empty-state-card">
          <Sparkles size={30} />
          <h2>Interview result not found</h2>
          <p>The session is unavailable or could not be loaded.</p>
          <button type="button" onClick={() => navigate('/dashboard/history')}>
            Back to history
          </button>
        </div>
      </div>
    );
  }

  const list = Array.isArray(session.questions) ? (session.questions as Array<Record<string, unknown>>) : [];

  return (
    <main className="history-detail-page">
      <header className="history-detail-header">
        <button type="button" className="history-detail-back" onClick={() => navigate('/dashboard/history')}>
          <ArrowLeft size={16} />
          Back to history
        </button>
      </header>

      <div className="history-detail-shell">
        <section className="history-detail-card">
          <div className="history-detail-title-wrap">
            <div>
              <h1 className="history-detail-title">{String(session.technology_id ?? 'Interview')} evaluation</h1>
              <p className="history-detail-subtitle">
                Submitted: {session.submitted_at ? new Date(String(session.submitted_at)).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="score-badge good">{aggregate.average}/100</div>
          </div>

          <div className="history-detail-summary">
            <div className="summary-stat-card primary">
              <span className="summary-stat-label">Average score</span>
              <span className="summary-stat-value">{aggregate.average}</span>
            </div>
            <div className="summary-stat-card success">
              <span className="summary-stat-label">Strong answers</span>
              <span className="summary-stat-value">{aggregate.passed}</span>
            </div>
          </div>

          <div className="overall-feedback">
            <strong>Overall feedback</strong>
            <p>{aggregate.feedback}</p>
          </div>

          {list.map((item, index) => {
            const evaluation = (item.evaluation as Record<string, unknown>) ?? {};
            const expectedKeywords = Array.isArray(item.expected_keywords) ? item.expected_keywords : [];
            const relevance = (evaluation.relevance as Record<string, unknown>) ?? {};
            const communication = (evaluation.communication_quality as Record<string, unknown>) ?? {};
            const starStructure = (evaluation.star_structure as Record<string, unknown>) ?? {};
            const score = Number(evaluation.overall_score ?? 0);
            const scoreClass = score >= 70 ? 'good' : score >= 45 ? 'medium' : 'low';

            return (
              <article key={`${String(item.question_id ?? index)}-${index}`} className="question-card">
                <div className="question-header">
                  <h3 className="question-title">Q{index + 1}. {String(item.question ?? 'Question')}</h3>
                  <span className={`score-badge ${scoreClass}`}>Score: {score}/100</span>
                </div>

                <ul className="keyword-list">
                  <li>
                    <strong>Expected keywords:</strong>{' '}
                    {expectedKeywords.length ? expectedKeywords.join(', ') : 'Not specified'}
                  </li>
                </ul>

                <div className="answer-block">
                  <strong>
                    <CheckCircle2 size={14} /> Candidate answer
                  </strong>
                  <p className="answer-content">{String(item.answer ?? '') || 'No answer provided.'}</p>
                </div>

                <div className="metric-grid">
                  <div className="metric-card">
                    <div className="metric-card-label">Relevance</div>
                    <span className="metric-card-value">{Number(relevance.score ?? 0)}/100</span>
                  </div>
                  <div className="metric-card">
                    <div className="metric-card-label">Communication</div>
                    <span className="metric-card-value">{Number(communication.score ?? 0)}/100</span>
                  </div>
                  <div className="metric-card">
                    <div className="metric-card-label">STAR</div>
                    <span className="metric-card-value">{Number(starStructure.score ?? 0)}/100</span>
                  </div>
                </div>

                <div className="feedback-block">
                  <strong>
                    <MessageSquareText size={14} /> Coach feedback
                  </strong>
                  <p className="feedback-content">{String(evaluation.feedback ?? 'No feedback generated.')}</p>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default InterviewHistoryDetailPage;
