import { useAuth } from '../../context/AuthContext';
import BalanceCard from './BalanceCard';
import RecentTransactions from './RecentTransactions';
import { FiSend, FiClock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const quickActions = [
  { label: 'Transfer', icon: FiSend, path: '/transfer', color: '#D4AF37' },
  { label: 'History', icon: FiClock, path: '/transactions', color: '#2ecc71' },
  { label: 'Profile', icon: FiUser, path: '/profile', color: '#3498db' },
];

export default function Dashboard() {
  const { account } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <BalanceCard account={account} />
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ '--accent': action.color }}
            >
              <action.icon className="action-icon" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
      <RecentTransactions />
    </div>
  );
}
