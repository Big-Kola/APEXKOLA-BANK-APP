import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';

export default function BalanceCard({ account }) {
  const [showBalance, setShowBalance] = useState(true);

  const formatBalance = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount || 0);
  };

  return (
    <div className="balance-card">
      <div className="balance-header">
        <span className="balance-label">Available Balance</span>
        <button className="toggle-balance" onClick={() => setShowBalance(!showBalance)}>
          {showBalance ? <FiEye /> : <FiEyeOff />}
        </button>
      </div>
      <h1 className="balance-amount">
        {showBalance ? formatBalance(account?.balance) : '***'}
      </h1>
      <div className="balance-details">
        <div className="detail-item">
          <span className="detail-label">Account Number</span>
          <span className="detail-value">{account?.accountNumber}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Account Type</span>
          <span className="detail-value capitalize">{account?.accountType}</span>
        </div>
      </div>
    </div>
  );
}
