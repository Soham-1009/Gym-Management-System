const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  assignMembership,
  getMemberAttendance,
  getMemberPayments,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'trainer'), getAllMembers)
  .post(authorize('admin'), createMember);

router.route('/:id')
  .get(getMemberById)
  .put(authorize('admin'), updateMember)
  .delete(authorize('admin'), deleteMember);

router.post('/:id/assign-membership', authorize('admin'), assignMembership);
router.get('/:id/attendance', getMemberAttendance);
router.get('/:id/payments', authorize('admin'), getMemberPayments);

module.exports = router;
