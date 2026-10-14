import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import TechnologyCard from './TechnologyCard'
import { technologies } from '../../../features/interviews/technologyCatalog'

describe('TechnologyCard', () => {
  it('shows a technology and links to its practice session', () => {
    render(<MemoryRouter><TechnologyCard technology={technologies[0]} /></MemoryRouter>)
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/practice/javascript')
  })

  it('exposes every technology card as a named keyboard-operable link', () => {
    render(<MemoryRouter>{technologies.map((technology) => <TechnologyCard key={technology.id} technology={technology} />)}</MemoryRouter>)
    for (const technology of technologies) {
      expect(screen.getByRole('link', { name: `Start ${technology.name} interview practice` }))
        .toHaveAttribute('href', `/practice/${technology.id}`)
    }
  })
})
