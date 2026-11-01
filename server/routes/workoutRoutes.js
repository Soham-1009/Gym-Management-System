const express = require('express');
const router = express.Router();
const {
  getAllExercises,
  createExercise,
  getAllWorkoutPlans,
  getWorkoutPlanById,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getMyWorkoutPlan,
} = require('../controllers/workoutController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/exercises', getAllExercises);
router.post('/exercises', authorize('admin', 'trainer'), createExercise);

router.get('/my', authorize('member', 'admin', 'trainer'), getMyWorkoutPlan);

router.route('/')
  .get(authorize('admin', 'trainer'), getAllWorkoutPlans)
  .post(authorize('admin', 'trainer'), createWorkoutPlan);

router.route('/:id')
  .get(authorize('admin', 'trainer'), getWorkoutPlanById)
  .put(authorize('admin', 'trainer'), updateWorkoutPlan)
  .delete(authorize('admin', 'trainer'), deleteWorkoutPlan);

module.exports = router;
