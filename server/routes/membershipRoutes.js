const express = require('express');
const router = express.Router();
const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllPlans);
router.get('/:id', getPlanById);

router.post('/', protect, authorize('admin'), createPlan);
router.put('/:id', protect, authorize('admin'), updatePlan);
router.delete('/:id', protect, authorize('admin'), deletePlan);

module.exports = router;
