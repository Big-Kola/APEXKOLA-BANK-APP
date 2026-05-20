import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiArrowUpRight, FiArrowDownLeft, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function TransactionHistory() {
  const [data, setData] = useState({ transactions: [], pagination: { page: 1, pages: 1 } });
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions?page=${page}&limit=20`);
      setData(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const getIcon = (type) => {
    if (type === 'credit') return <FiArrowDownLeft className="txn-icon credit" />;
    if (type === 'debit') return <FiArrowUpRight className="txn-icon debit" />;
    return <FiArrowRight className="txn-icon transfer" />;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Transaction History</h2>
      <div className="transactions-card">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : data.transactions.length === 0 ? (
          <p className="empty-state">No transactions found</p>
        ) : (
          <>
            <div className="txn-table">
              <div className="txn-table-header">
                <span>Description</span>
                <span>Date</span>
                <span>Reference</span>
                <span>Status</span>
                <span>Amount</span>
              </div>
              {data.transactions.map((txn) => (
                <div key={txn._id} className="txn-table-row">
                  <div className="txn-info">
                    {getIcon(txn.type)}
                    <span>{txn.description || txn.type}</span>
                  </div>
                  <span className="txn-date-cell">{formatDate(txn.createdAt)}</span>
                  <span className="txn-ref">{txn.reference}</span>
                  <span className={`txn-status ${txn.status}`}>{txn.status}</span>
                  <span className={`txn-amount-cell ${txn.type}`}>
                    {txn.type === 'debit' ? '-' : '+'}{formatAmount(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
            {data.pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn-secondary"
                  disabled={data.pagination.page <= 1}
                  onClick={() => fetchTransactions(data.pagination.page - 1)}
                >
                  <FiChevronLeft />
                </button>
                <span>Page {data.pagination.page} of {data.pagination.pages}</span>
                <button
                  className="btn-secondary"
                  disabled={data.pagination.page >= data.pagination.pages}
                  onClick={() => fetchTransactions(data.pagination.page + 1)}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
