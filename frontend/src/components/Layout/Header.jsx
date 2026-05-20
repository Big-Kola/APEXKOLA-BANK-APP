import { useAuth } from '../../context/AuthContext';
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-search">
        <span>Welcome back, <strong>{user?.firstName}</strong></span>
      </div>
      <div className="header-actions">
        <button className="icon-btn"><FiBell /></button>
        <button className="icon-btn" onClick={() => navigate('/profile')}><FiUser /></button>
        <button className="icon-btn logout-btn" onClick={handleLogout}><FiLogOut /></button>
      </div>
    </header>
  );
}
