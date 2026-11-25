import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getGeneratedQuestions,
  saveAnswerToSession,
  submitInterview,
} from '../../features/interviews/interviewService';
import QuestionPage from './QuestionPage';
import TestCompletedPage from '../TestCompletedPage/TestCompletedPage';

vi.mock('../../features/interviews/interviewService', () => ({
  getGeneratedQuestions: vi.fn(),
  saveAnswerToSession: vi.fn(),
  submitInterview: vi.fn(),
}));

describe('QuestionPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.mocked(getGeneratedQuestions).mockResolvedValue([
      {
        id: 1,
        title: 'Explain the event loop',
        prompt: 'Explain how the event loop works.',
        topic: 'JavaScript',
        difficulty: 'Medium',
      },
      {
        id: 2,
        title: 'Closures',
        prompt: 'Explain closures.',
        topic: 'JavaScript',
        difficulty: 'Medium',
      },
    ]);
    vi.mocked(saveAnswerToSession).mockResolvedValue({ success: true });
    vi.mocked(submitInterview).mockResolvedValue({
      success: true,
      message: 'You successfully completed the test.',
    });
  });

  it('loads experience-based questions and reports answer submission', async () => {
    render(
      <MemoryRouter initialEntries={['/practice/javascript?years=7&level=Expert']}>
        <Routes>
          <Route path="/practice/:technologyId" element={<QuestionPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'JavaScript interview' })).toBeInTheDocument();
    expect(screen.getByText(/expert/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Explain the event loop' })).toBeInTheDocument();
    expect(screen.getByRole('timer', { name: 'Time remaining 30:00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit answer/ })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: /Submit answer/ })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Question 2' }));
    expect(screen.getByRole('heading', { name: 'Closures' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Question 2' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    fireEvent.change(screen.getByLabelText('Your answer'), {
      target: { value: 'A closure keeps access to its lexical scope.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit answer/ }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Answer saved/);
  });

  it('submits an unanswered test when time expires and shows the completion page', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/practice/javascript']}>
        <Routes>
          <Route path="/practice/:technologyId" element={<QuestionPage />} />
          <Route path="/practice/:technologyId/completed" element={<TestCompletedPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole('heading', { name: 'JavaScript interview' })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30 * 60 * 1000);
    });

    expect(
      screen.getByRole('heading', { name: 'You successfully completed the test' }),
    ).toBeInTheDocument();
    expect(submitInterview).toHaveBeenCalledWith('javascript', expect.any(Array), {});
  });
});
