const express = require('express');
const { getIncomes, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Apply protect middleware to all routes in this file

router.route('/')
  .get(getIncomes)
  .post(createIncome);

router.route('/:id')
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router;
