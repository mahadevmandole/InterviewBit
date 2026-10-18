import { BookOpenCheck, LayoutDashboard, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { logout } from '../../../features/auth/authService';
import Brand from '../../atoms/Brand/Brand';
import './DashboardSidebar.scss';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My practice', to: '/dashboard/history', icon: BookOpenCheck },
];

function DashboardSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <Brand />
      </div>
      <p className="sidebar-section-label">WORKSPACE</p>
      <nav className="sidebar-navigation" aria-label="Main navigation">
        {navigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
            {label === 'My practice' && <span className="nav-count">10</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">L</div>
          <div>
            <strong>Learner</strong>
            <span>Candidate account</span>
          </div>
        </div>
        <Button variant="outline" className="logout-button" type="button" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign out</span>
        </Button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
