import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Brand from './Brand'

describe('Brand', () => {
  it('renders the RoundZero wordmark', () => {
    render(<Brand />)
    expect(screen.getByRole('link', { name: 'RoundZero home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'RoundZero home' })).toHaveTextContent('RoundZero')
  })
})
