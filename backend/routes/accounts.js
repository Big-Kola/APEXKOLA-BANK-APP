const express = require('express');
const router = express.Router();
const {
  getAccounts,
  getAccount,
  createAccount,
  getAccountByNumber,
} = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.get('/number/:accountNumber', getAccountByNumber);

module.exports = router;
