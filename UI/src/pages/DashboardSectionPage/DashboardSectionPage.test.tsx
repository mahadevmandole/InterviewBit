import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DashboardSectionPage from './DashboardSectionPage';

describe('DashboardSectionPage', () => {
  it('shows a placeholder for the selected workspace section', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/progress']}>
        <Routes>
          <Route path="/dashboard/:section" element={<DashboardSectionPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
  });
});
