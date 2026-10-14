import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import QuestionPage from './QuestionPage';

describe('QuestionPage', () => {
  it('navigates question numbers and reports answer submission', () => {
    render(
      <MemoryRouter initialEntries={['/practice/javascript']}>
        <Routes>
          <Route path="/practice/:technologyId" element={<QuestionPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'JavaScript interview' })).toBeInTheDocument();
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
    expect(screen.getByRole('status')).toHaveTextContent(/Answer saved/);
  });
});
