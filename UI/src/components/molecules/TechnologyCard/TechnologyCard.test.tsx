import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TechnologyCard from './TechnologyCard';
import { technologies } from '../../../features/interviews/technologyCatalog';

describe('TechnologyCard', () => {
  it('shows a technology card and triggers selection when clicked', () => {
    const onSelect = vi.fn();

    render(
      <MemoryRouter>
        <TechnologyCard technology={technologies[0]} onSelect={onSelect} />
      </MemoryRouter>,
    );

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /JavaScript/i }));
    expect(onSelect).toHaveBeenCalledWith(technologies[0]);
  });

  it('exposes every technology card as a named keyboard-operable button', () => {
    render(
      <MemoryRouter>
        {technologies.map((technology) => (
          <TechnologyCard key={technology.id} technology={technology} />
        ))}
      </MemoryRouter>,
    );
    for (const technology of technologies) {
      expect(
        screen.getByRole('button', { name: `Start ${technology.name} interview practice` }),
      ).toBeInTheDocument();
    }
  });
});
