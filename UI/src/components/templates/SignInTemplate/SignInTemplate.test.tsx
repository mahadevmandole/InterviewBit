import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignInTemplate from './SignInTemplate'

describe('SignInTemplate', () => {
  it('lays out the story and sign-in panels', () => {
    render(<SignInTemplate />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'RoundZero introduction' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Sign in' })).toBeInTheDocument()
  })
})
