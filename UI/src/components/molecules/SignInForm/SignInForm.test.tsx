import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SignInForm from './SignInForm'

describe('SignInForm', () => {
  it('reveals and hides the password', () => {
    render(<MemoryRouter><SignInForm /></MemoryRouter>)
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('keeps the remember checkbox and submit action in the keyboard tab order', () => {
    render(<MemoryRouter><SignInForm /></MemoryRouter>)
    expect(screen.getByRole('checkbox', { name: 'Keep me signed in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  it('shows an inline message when credentials are incorrect', () => {
    render(<MemoryRouter><SignInForm /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'incorrect' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Check your email and password/)
  })

  it('redirects the demo account to the dashboard after successful sign-in', async () => {
    localStorage.clear()
    sessionStorage.clear()
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<SignInForm />} /><Route path="/dashboard" element={<h1>Dashboard</h1>} /></Routes></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@gmail.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
})
