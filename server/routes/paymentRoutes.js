const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  recordPayment,
  getMyPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', authorize('member', 'admin', 'trainer'), getMyPayments);
router.route('/')
  .get(authorize('admin'), getAllPayments)
  .post(authorize('admin'), recordPayment);

router.get('/:id', getPaymentById);

module.exports = router;
