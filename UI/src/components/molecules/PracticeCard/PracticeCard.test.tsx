import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PracticeCard from './PracticeCard'

describe('PracticeCard', () => {
  it('previews the interview question count and technology', () => {
    render(<PracticeCard />)
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText(/Write your answer/)).toBeInTheDocument()
  })
})
