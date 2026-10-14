import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, ChevronRight, Clock3, Send } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getQuestions } from '../../features/interviews/questionBank';
import { technologies } from '../../features/interviews/technologyCatalog';
import './QuestionPage.scss';

function QuestionPage() {
  const testDurationSeconds = 30 * 60;
  const navigate = useNavigate();
  const { technologyId = '' } = useParams();
  const technology = technologies.find((item) => item.id === technologyId);
  const questions = getQuestions(technologyId);
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(testDurationSeconds);
  const [timeExpired, setTimeExpired] = useState(false);
  const currentQuestion = questions[activeQuestion - 1];

  useEffect(() => {
    setTimeLeft(testDurationSeconds);
    setTimeExpired(false);
    const deadline = Date.now() + testDurationSeconds * 1000;
    const timerId = window.setInterval(() => {
      const nextTime = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(nextTime);
      if (nextTime === 0) {
        setTimeExpired(true);
        window.clearInterval(timerId);
      }
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [technologyId]);

  if (!technology || !currentQuestion) return <Navigate to="/dashboard" replace />;

  function handleAnswerChange(value: string) {
    setAnswers((current) => ({ ...current, [activeQuestion]: value }));
    setFeedback('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timeExpired) return;
    if (!answers[activeQuestion]?.trim()) {
      setFeedback('Add your answer before submitting this question.');
      return;
    }
    setSubmitted((current) =>
      current.includes(activeQuestion) ? current : [...current, activeQuestion],
    );
    setFeedback('Answer saved. You can revisit or update it before finishing.');
  }

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="question-page">
      <header className="question-topbar">
        <div className="practice-heading">
          <button
            type="button"
            className="practice-back-button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="practice-title keyboard-heading" tabIndex={0}>
            {technology.name} interview
          </h1>
        </div>
        <div className="practice-topbar-right">
          <span className="practice-status-dot" /> Practice session{' '}
          <span className="topbar-separator" />
          <span
            className={`practice-timer${timeLeft <= 300 ? ' timer-warning' : ''}${timeExpired ? ' timer-expired' : ''}`}
            role="timer"
            aria-label={`Time remaining ${formattedTime}`}
          >
            <Clock3 size={15} />
            {timeExpired ? 'Time is up' : formattedTime}
          </span>
        </div>
      </header>

      <div className="practice-progress">
        <span id="practice-progress-label">
          <strong>{submitted.length}</strong> of 10 answered
        </span>
        <div
          className="progress-track"
          role="progressbar"
          aria-labelledby="practice-progress-label"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={submitted.length}
          aria-valuetext={`${submitted.length} of 10 questions answered`}
        >
          <span style={{ width: `${submitted.length * 10}%` }} />
        </div>
        <span aria-hidden="true">{Math.round((submitted.length / 10) * 100)}%</span>
      </div>

      <section className="question-workspace">
        <aside className="question-nav-panel" aria-label="Question navigation">
          <div className="question-nav-heading">
            <div>
              <strong>Questions</strong>
              <span>Choose a question</span>
            </div>
            <span className="question-total">10</span>
          </div>
          <ol className="question-number-list">
            {questions.map((question) => {
              const isAnswered = submitted.includes(question.id);
              const isActive = activeQuestion === question.id;
              return (
                <li key={question.id}>
                  <button
                    type="button"
                    className={`question-number-button${isActive ? ' active' : ''}${isAnswered ? ' answered' : ''}`}
                    onClick={() => {
                      setActiveQuestion(question.id);
                      setFeedback('');
                    }}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Question ${question.id}${isAnswered ? ', answered' : ''}`}
                  >
                    <span className="number-value">{question.id.toString().padStart(2, '0')}</span>
                    {isAnswered ? (
                      <Check size={14} className="answered-check" />
                    ) : (
                      <span className="number-state" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="question-nav-legend">
            <span className="legend-dot current" /> Current <span className="legend-dot done" />{' '}
            Answered
          </div>
        </aside>

        <article className="question-detail-card">
          <div className="question-detail-top">
            <div className="detail-index">
              QUESTION <strong>{currentQuestion.id.toString().padStart(2, '0')}</strong>
              <span> / 10</span>
            </div>
            <div className="question-badges">
              <span className="topic-badge">{currentQuestion.topic}</span>
              <span
                className={`difficulty-badge difficulty-${currentQuestion.difficulty.toLowerCase()}`}
              >
                {currentQuestion.difficulty}
              </span>
            </div>
          </div>
          <h2 className="keyboard-heading" tabIndex={0} aria-live="polite" aria-atomic="true">
            {currentQuestion.title}
          </h2>
          <p className="question-prompt">{currentQuestion.prompt}</p>
          <div className="answer-guidance">
            <span className="guidance-spark">✳</span>
            <span>
              Take a moment to structure your thoughts. Explain your reasoning as you would in a
              real interview.
            </span>
          </div>
          <form className="answer-form" onSubmit={handleSubmit}>
            <label htmlFor="candidate-answer">Your answer</label>
            <textarea
              id="candidate-answer"
              value={answers[activeQuestion] ?? ''}
              onChange={(event) => handleAnswerChange(event.target.value)}
              placeholder={
                timeExpired
                  ? 'Time is up. Your answer can no longer be changed.'
                  : 'Write your answer here...'
              }
              rows={9}
              disabled={timeExpired}
            />
            <div className="answer-form-bottom">
              <span>
                {(answers[activeQuestion] ?? '').trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <span>Draft is saved for this session</span>
            </div>
            {timeExpired && (
              <p className="timer-ended-message" role="alert">
                Your 30-minute practice time has ended. You can review your answers.
              </p>
            )}
            {feedback && (
              <p
                className={`answer-feedback${submitted.includes(activeQuestion) ? ' success' : ''}`}
                role="status"
              >
                {feedback}
              </p>
            )}
            <div className="answer-actions">
              <button
                className="submit-answer-button"
                type="submit"
                tabIndex={0}
                disabled={timeExpired}
              >
                <Send size={15} />{' '}
                {submitted.includes(activeQuestion) ? 'Update answer' : 'Submit answer'}
              </button>
              <button
                className="next-question-button"
                type="button"
                onClick={() => {
                  setActiveQuestion((current) => Math.min(current + 1, 10));
                  setFeedback('');
                }}
                disabled={activeQuestion === 10}
              >
                Next question <ChevronRight size={16} />
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}

export default QuestionPage;
