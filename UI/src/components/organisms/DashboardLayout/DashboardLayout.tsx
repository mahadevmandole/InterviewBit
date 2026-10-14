import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DashboardSidebar from '../DashboardSidebar/DashboardSidebar'
import './DashboardLayout.scss'

function DashboardLayout() {
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    mainRef.current?.focus()
  }, [pathname])

  return <div className="dashboard-app"><a className="skip-link" href="#main-content">Skip to main content</a><DashboardSidebar /><main ref={mainRef} className="dashboard-main" id="main-content" tabIndex={-1}><Outlet /></main></div>
}

export default DashboardLayout
