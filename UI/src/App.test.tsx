import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App routes', () => {
  it('sends unauthenticated dashboard visitors to sign-in', () => {
    localStorage.clear();
    sessionStorage.clear();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeInTheDocument();
  });

  it('takes the demo user from sign-in to the dashboard', async () => {
    localStorage.clear();
    sessionStorage.clear();
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'test@gmail.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      await screen.findByRole('heading', { name: /Choose your tech stack/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
