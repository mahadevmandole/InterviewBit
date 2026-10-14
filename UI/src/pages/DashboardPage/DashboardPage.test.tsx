import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  it('lists searchable technology practice cards', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /Choose your tech stack/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /JavaScript/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Python/ })).toBeInTheDocument()
  })
})
