import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout', () => {
  it('renders the shared navigation around its child route', () => {
    render(<MemoryRouter initialEntries={['/']}><Routes><Route element={<DashboardLayout />}><Route path="/" element={<h1>Dashboard content</h1>} /></Route></Routes></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Dashboard content' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})
