import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSend, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function TransferForm() {
  const { account, fetchProfile } = useAuth();
  const [form, setForm] = useState({
    toAccountNumber: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [searching, setSearching] = useState(false);

  const lookupAccount = async () => {
    if (form.toAccountNumber.length < 10) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/accounts/number/${form.toAccountNumber}`);
      setRecipient(data);
    } catch {
      setRecipient(null);
      toast.error('Account not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient) return toast.error('Please verify the recipient account');

    if (Number(form.amount) > (account?.balance || 0)) {
      return toast.error('Insufficient balance');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/transactions/transfer', {
        toAccountNumber: form.toAccountNumber,
        amount: Number(form.amount),
        description: form.description,
      });
      toast.success(`Transferred ₦${Number(form.amount).toLocaleString()} successfully!`);
      await fetchProfile();
      setForm({ toAccountNumber: '', amount: '', description: '' });
      setRecipient(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Transfer Funds</h2>
      <div className="transfer-card">
        <div className="balance-info">
          <span>Available Balance</span>
          <strong>
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(account?.balance || 0)}
          </strong>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Recipient Account Number</label>
            <div className="input-with-btn">
              <input
                type="text"
                maxLength={10}
                placeholder="Enter 10-digit account number"
                value={form.toAccountNumber}
                onChange={(e) => {
                  setForm({ ...form, toAccountNumber: e.target.value.replace(/\D/g, '') });
                  setRecipient(null);
                }}
                required
              />
              <button type="button" className="btn-secondary" onClick={lookupAccount} disabled={searching || form.toAccountNumber.length < 10}>
                {searching ? '...' : <FiSearch />}
              </button>
            </div>
            {recipient && (
              <div className="recipient-info">
                <FiSend />
                <span>{recipient.accountName} | {recipient.accountNumber}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Amount (NGN)</label>
            <input
              type="number"
              placeholder="0.00"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <input
              type="text"
              placeholder="What's this for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary full-width" disabled={loading || !recipient}>
            {loading ? 'Processing...' : 'Send Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}
