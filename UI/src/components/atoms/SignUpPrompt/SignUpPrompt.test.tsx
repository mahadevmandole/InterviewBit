import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignUpPrompt from './SignUpPrompt'

describe('SignUpPrompt', () => {
  it('links new users to account creation', () => {
    render(<SignUpPrompt />)
    expect(screen.getByText(/New to RoundZero/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Create an account/ })).toHaveAttribute('href', '#create-account')
  })
})
