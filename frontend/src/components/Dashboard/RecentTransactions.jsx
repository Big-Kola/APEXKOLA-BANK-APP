import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FiArrowUpRight, FiArrowDownLeft, FiArrowRight } from 'react-icons/fi';

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/transactions?limit=5').then(({ data }) => {
      setTransactions(data.transactions);
    }).catch(() => {});
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getIcon = (type) => {
    if (type === 'credit') return <FiArrowDownLeft className="txn-icon credit" />;
    if (type === 'debit') return <FiArrowUpRight className="txn-icon debit" />;
    return <FiArrowRight className="txn-icon transfer" />;
  };

  return (
    <div className="recent-transactions">
      <div className="section-header">
        <h3>Recent Transactions</h3>
        <button className="link-btn" onClick={() => navigate('/transactions')}>View All</button>
      </div>
      {transactions.length === 0 ? (
        <p className="empty-state">No transactions yet</p>
      ) : (
        <div className="transaction-list">
          {transactions.map((txn) => (
            <div key={txn._id} className="transaction-item">
              <div className="txn-left">
                {getIcon(txn.type)}
                <div>
                  <p className="txn-description">{txn.description || txn.type}</p>
                  <span className="txn-date">{formatDate(txn.createdAt)}</span>
                </div>
              </div>
              <span className={`txn-amount ${txn.type}`}>
                {txn.type === 'debit' ? '-' : '+'}{formatAmount(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
