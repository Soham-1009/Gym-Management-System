const express = require('express');
const router = express.Router();
const {
  recordProgress,
  getMemberProgressHistory,
  getMyProgress,
  deleteProgress,
} = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', recordProgress);
router.get('/my', authorize('member', 'admin', 'trainer'), getMyProgress);
router.get('/member/:id', getMemberProgressHistory);
router.delete('/:id', authorize('admin', 'trainer'), deleteProgress);

module.exports = router;
