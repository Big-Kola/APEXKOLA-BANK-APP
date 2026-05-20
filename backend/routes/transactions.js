const express = require('express');
const router = express.Router();
const { getTransactions, transferFunds } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTransactions);
router.post('/transfer', transferFunds);

module.exports = router;
