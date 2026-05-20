const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ account: account._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ account: account._id });

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.transferFunds = async (req, res) => {
  try {
    const { toAccountNumber, amount, description } = req.body;

    if (!toAccountNumber || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer details' });
    }

    const fromAccount = await Account.findOne({ user: req.user._id });
    if (!fromAccount) {
      return res.status(404).json({ message: 'Sender account not found' });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!toAccount) {
      return res.status(404).json({ message: 'Recipient account not found' });
    }

    if (fromAccount.accountNumber === toAccountNumber) {
      return res.status(400).json({ message: 'Cannot transfer to your own account' });
    }

    fromAccount.balance -= Number(amount);
    toAccount.balance += Number(amount);

    await fromAccount.save();
    await toAccount.save();

    const debitTransaction = await Transaction.create({
      account: fromAccount._id,
      type: 'debit',
      amount: Number(amount),
      description: description || 'Transfer',
      toAccount: toAccountNumber,
      recipientName: `${toAccount.user?.firstName || ''} ${toAccount.user?.lastName || ''}`.trim(),
      status: 'completed',
    });

    await Transaction.create({
      account: toAccount._id,
      type: 'credit',
      amount: Number(amount),
      description: description || 'Transfer received',
      fromAccount: fromAccount.accountNumber,
      status: 'completed',
    });

    const populatedAccount = await Account.findOne({ user: req.user._id });

    res.json({
      message: 'Transfer successful',
      transaction: debitTransaction,
      newBalance: populatedAccount.balance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
};
