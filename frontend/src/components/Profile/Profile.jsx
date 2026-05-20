import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign } from 'react-icons/fi';

export default function Profile() {
  const { user, account } = useAuth();

  return (
    <div className="page-container">
      <h2 className="page-title">Profile</h2>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <h3>{user?.firstName} {user?.lastName}</h3>
        </div>
        <div className="profile-details">
          <div className="detail-row">
            <FiUser />
            <div>
              <label>Full Name</label>
              <p>{user?.firstName} {user?.lastName}</p>
            </div>
          </div>
          <div className="detail-row">
            <FiMail />
            <div>
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="detail-row">
            <FiPhone />
            <div>
              <label>Phone</label>
              <p>{user?.phone}</p>
            </div>
          </div>
          <div className="detail-row">
            <FiDollarSign />
            <div>
              <label>Account Number</label>
              <p>{account?.accountNumber}</p>
            </div>
          </div>
          <div className="detail-row">
            <FiCalendar />
            <div>
              <label>Member Since</label>
              <p>{new Date(user?.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
