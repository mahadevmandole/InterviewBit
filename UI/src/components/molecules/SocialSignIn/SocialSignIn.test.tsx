import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SocialSignIn from './SocialSignIn';

describe('SocialSignIn', () => {
  it('offers the configured social providers', () => {
    render(<SocialSignIn />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
  });
});
