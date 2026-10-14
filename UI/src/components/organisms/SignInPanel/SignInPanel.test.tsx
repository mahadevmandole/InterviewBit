import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignInPanel from './SignInPanel'

describe('SignInPanel', () => {
  it('combines the sign-in heading, form, and account prompt', () => {
    render(<SignInPanel />)
    expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Create an account/ })).toBeInTheDocument()
  })
})
