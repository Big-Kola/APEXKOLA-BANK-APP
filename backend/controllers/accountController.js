const Account = require('../models/Account');

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { accountType } = req.body;

    const existingAccounts = await Account.countDocuments({ user: req.user._id });
    if (existingAccounts >= 3) {
      return res.status(400).json({ message: 'Maximum of 3 accounts per user' });
    }

    const account = await Account.create({
      user: req.user._id,
      accountType: accountType || 'savings',
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAccountByNumber = async (req, res) => {
  try {
    const account = await Account.findOne({
      accountNumber: req.params.accountNumber,
    }).populate('user', 'firstName lastName');

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      accountName: `${account.user.firstName} ${account.user.lastName}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
