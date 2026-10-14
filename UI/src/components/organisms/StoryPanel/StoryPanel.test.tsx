import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StoryPanel from './StoryPanel';

describe('StoryPanel', () => {
  it('shows the product story and practice preview', () => {
    render(<StoryPanel />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Make your next.*interview.*your best/,
    );
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText(/Good things start with practice/)).toBeInTheDocument();
  });
});
