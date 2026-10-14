import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SignInPage from './SignInPage'

describe('SignInPage', () => {
  it('renders the RoundZero sign-in experience', () => {
    render(<MemoryRouter><SignInPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })
})
