import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DashboardPage from './DashboardPage';

function RouteTracker() {
  const location = useLocation();
  return <div data-testid="route">{location.pathname + location.search}</div>;
}

describe('DashboardPage', () => {
  it('lists searchable technology practice cards', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Choose your tech stack/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /JavaScript/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Python/i })).toBeInTheDocument();
  });

  it('opens a popup to collect experience before starting practice', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/practice/:technologyId" element={<RouteTracker />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /JavaScript/i }));

    expect(screen.getByRole('dialog', { name: /experience setup/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/total experience/i), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start practice/i }));

    expect(screen.getByTestId('route')).toHaveTextContent('/practice/javascript?years=7&level=Expert');
  });
});
