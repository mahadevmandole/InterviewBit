import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SignInFooter from './SignInFooter';

describe('SignInFooter', () => {
  it('shows terms, privacy, and secure sign-in information', () => {
    render(<SignInFooter />);
    expect(screen.getByText(/By continuing/)).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/Secure sign in/)).toBeInTheDocument();
  });
});
