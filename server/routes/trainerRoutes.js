const express = require('express');
const router = express.Router();
const {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getAssignedMembers,
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAllTrainers)
  .post(authorize('admin'), createTrainer);

router.route('/:id')
  .get(getTrainerById)
  .put(authorize('admin', 'trainer'), updateTrainer)
  .delete(authorize('admin'), deleteTrainer);

router.get('/:id/members', authorize('admin', 'trainer'), getAssignedMembers);

module.exports = router;
