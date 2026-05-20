import { NavLink } from 'react-router-dom';
import { FiGrid, FiSend, FiClock, FiUser, FiDollarSign } from 'react-icons/fi';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/transfer', label: 'Transfer', icon: FiSend },
  { to: '/transactions', label: 'Transactions', icon: FiClock },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FiDollarSign className="brand-icon" />
        <div>
          <h2>ApexKola</h2>
          <span className="brand-sub">Bank</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <link.icon className="nav-icon" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>ApexKola Bank &copy; 2024</p>
      </div>
    </aside>
  );
}
