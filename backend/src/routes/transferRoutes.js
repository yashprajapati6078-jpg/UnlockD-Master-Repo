const express = require('express');
const { getTransfers, createTransfer } = require('../controllers/transferController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTransfers)
  .post(createTransfer);

module.exports = router;
