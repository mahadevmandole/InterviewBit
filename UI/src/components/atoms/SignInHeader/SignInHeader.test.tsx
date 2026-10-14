import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SignInHeader from './SignInHeader';

describe('SignInHeader', () => {
  it('welcomes returning users', () => {
    render(<SignInHeader />);
    expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeInTheDocument();
    expect(screen.getByText(/fresh start/i)).toBeInTheDocument();
  });
});
