import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DashboardSectionPage from './DashboardSectionPage';

describe('DashboardSectionPage', () => {
  it('shows a not-found message for unsupported workspace sections', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/legacy']}>
        <Routes>
          <Route path="/dashboard/:section" element={<DashboardSectionPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
