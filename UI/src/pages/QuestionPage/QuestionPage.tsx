import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, ChevronRight, Clock3, LoaderCircle, Send } from 'lucide-react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getExperienceLevel, type ExperienceLevel } from '../../features/interviews/experienceLevel';
import {
  getGeneratedQuestions,
  saveAnswerToSession,
  submitInterview,
  type GeneratedQuestion,
} from '../../features/interviews/interviewService';
import { technologies } from '../../features/interviews/technologyCatalog';
import { showToast } from '../../lib/toast';
import './QuestionPage.scss';

function QuestionPage() {
  const testDurationSeconds = 30 * 60;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { technologyId = '' } = useParams();
  const technology = technologies.find((item) => item.id === technologyId);
  const yearsOfExperience = Number(searchParams.get('years') ?? 0);
  const experienceLevel =
    (searchParams.get('level') as ExperienceLevel | null) ??
    getExperienceLevel(yearsOfExperience);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionLoadError, setQuestionLoadError] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(testDurationSeconds);
  const [timeExpired, setTimeExpired] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
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

  useEffect(() => {
    let isMounted = true;
    setIsLoadingQuestions(true);
    setQuestionLoadError('');
    setQuestions([]);

    getGeneratedQuestions(technologyId, experienceLevel)
      .then((generatedQuestions) => {
        if (!isMounted) return;
        setQuestions(generatedQuestions);
        setActiveQuestion(generatedQuestions[0]?.id ?? 1);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'We could not load questions for this interview.';
        setQuestionLoadError(message);
        showToast(message, 'error');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [technologyId, experienceLevel]);

  if (!technology) return <Navigate to="/dashboard" replace />;

  async function handleRetryQuestions() {
    setIsLoadingQuestions(true);
    setQuestionLoadError('');
    try {
      const generatedQuestions = await getGeneratedQuestions(technologyId, experienceLevel);
      setQuestions(generatedQuestions);
      setActiveQuestion(generatedQuestions[0]?.id ?? 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not load questions for this interview.';
      setQuestionLoadError(message);
      showToast(message, 'error');
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  if (isLoadingQuestions) {
    return (
      <main className="question-loading-page" aria-live="polite" aria-busy="true">
        <LoaderCircle className="question-loader-icon" size={34} aria-hidden="true" />
        <h1>Preparing your interview</h1>
        <p>We’re requesting personalized questions. This may take a moment.</p>
      </main>
    );
  }

  if (questionLoadError || questions.length === 0) {
    return (
      <main className="question-loading-page question-loading-error" role="status">
        <h1>{questionLoadError ? 'Questions could not be loaded' : 'No questions available'}</h1>
        <p>{questionLoadError || 'The question service returned no questions. Please try again.'}</p>
        <Button type="button" className="submit-answer-button" onClick={handleRetryQuestions}>
          Try again
        </Button>
        <Button type="button" variant="outline" className="next-question-button" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </main>
    );
  }

  if (isCompleting) {
    return (
      <main className="question-loading-page question-submit-loading" aria-live="polite" aria-busy="true">
        <LoaderCircle className="question-loader-icon" size={38} aria-hidden="true" />
        <h1>Submitting your test</h1>
        <p>Your answers are being evaluated. This may take a moment.</p>
      </main>
    );
  }

  if (!currentQuestion) return null;

  function handleAnswerChange(value: string) {
    setAnswers((current) => ({ ...current, [activeQuestion]: value }));
    setFeedback('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timeExpired) return;
    if (!answers[activeQuestion]?.trim()) {
      setFeedback('Add your answer before submitting this question.');
      return;
    }

    const answer = answers[activeQuestion] ?? '';
    setIsSavingAnswer(true);
    let saveResult;
    try {
      saveResult = await saveAnswerToSession(
        technologyId,
        currentQuestion.id,
        currentQuestion.title,
        answer,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save your answer right now.';
      showToast(message, 'error');
      setFeedback(message);
      setIsSavingAnswer(false);
      return;
    }
    setIsSavingAnswer(false);

    if (!saveResult.success) {
      const message = saveResult.message ?? 'Unable to save your answer right now.';
      showToast(message, 'error');
      setFeedback(message);
      return;
    }

    setSubmitted((current) =>
      current.includes(activeQuestion) ? current : [...current, activeQuestion],
    );
    setFeedback('Answer saved. You can revisit or update it before finishing.');
  }

  async function handleFinishTest() {
    if (timeExpired) return;
    if (!questions.every((question) => (answers[question.id] ?? '').trim())) {
      setFeedback('Please answer every question before submitting the test.');
      return;
    }

    setIsCompleting(true);
    let result;
    try {
      result = await submitInterview(technologyId, questions, answers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit your interview right now.';
      showToast(message, 'error');
      setFeedback(message);
      setIsCompleting(false);
      return;
    }
    setIsCompleting(false);

    if (!result.success) {
      showToast(result.message, 'error');
      setFeedback(result.message);
      return;
    }

    navigate(`/practice/${technologyId}/completed`);
  }

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="question-page">
      <header className="question-topbar">
        <div className="practice-heading">
          <Button
            type="button"
            variant="ghost"
            className="practice-back-button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="practice-title keyboard-heading" tabIndex={0}>
            {technology.name} interview
          </h1>
        </div>
        <div className="practice-topbar-right">
          <span className="practice-status-dot" /> Practice session{' '}
          <span className="topbar-separator" />
          <span className="practice-level-badge">{experienceLevel}</span>
          <span
            className={`practice-timer${timeLeft <= 300 ? ' timer-warning' : ''}${timeExpired ? ' timer-expired' : ''}`}
            role="timer"
            aria-label={`Time remaining ${formattedTime}`}
          >
            <Clock3 size={15} />
            {timeExpired ? 'Time is up' : formattedTime}
          </span>
          <Button
            type="button"
            className="submit-answer-button finish-test-button"
            onClick={handleFinishTest}
            disabled={timeExpired || isCompleting}
          >
            <Send size={14} /> Submit test
          </Button>
        </div>
      </header>

      <div className="practice-progress">
        <span id="practice-progress-label">
          <strong>{submitted.length}</strong> of {questions.length} answered
        </span>
        <div
          className="progress-track"
          role="progressbar"
          aria-labelledby="practice-progress-label"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={submitted.length}
          aria-valuetext={`${submitted.length} of ${questions.length} questions answered`}
        >
          <span style={{ width: `${(submitted.length / Math.max(questions.length, 1)) * 100}%` }} />
        </div>
        <span aria-hidden="true">{Math.round((submitted.length / Math.max(questions.length, 1)) * 100)}%</span>
      </div>

      <section className="question-workspace">
        <aside className="question-nav-panel" aria-label="Question navigation">
          <div className="question-nav-heading">
            <div>
              <strong>Questions</strong>
              <span>Choose a question</span>
            </div>
            <span className="question-total">{questions.length}</span>
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
              <span> / {questions.length}</span>
            </div>
            <div className="question-badges">
              <span className="topic-badge">{currentQuestion.topic ?? currentQuestion.title.split(' ')[0]}</span>
              <span
                className={`difficulty-badge difficulty-${String(currentQuestion.difficulty ?? 'medium').toLowerCase()}`}
              >
                {currentQuestion.difficulty ?? 'Medium'}
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
              <Button
                className="submit-answer-button"
                type="submit"
                tabIndex={0}
                disabled={timeExpired || isSavingAnswer}
              >
                {isSavingAnswer ? <LoaderCircle className="button-loader-icon" size={15} /> : <Send size={15} />}{' '}
                {isSavingAnswer ? 'Saving answer…' : submitted.includes(activeQuestion) ? 'Update answer' : 'Submit answer'}
              </Button>
              <Button
                variant="outline"
                className="next-question-button"
                type="button"
                onClick={() => {
                  setActiveQuestion((current) => Math.min(current + 1, questions.length));
                  setFeedback('');
                }}
                disabled={activeQuestion === questions.length}
              >
                Next question <ChevronRight size={16} />
              </Button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}

export default QuestionPage;
