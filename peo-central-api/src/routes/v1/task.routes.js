const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { TaskController } = require('../../controllers');
const { taskValidations } = require('../../validations');

router.route('/counts').get(verifyToken, TaskController.getTaskStatistics);

router
  .route('/')
  .all(verifyToken)
  .post(TaskController.fetchTasks)

router
  .route('/list')
  .all(verifyToken)
  .post(TaskController.fetchUserTasksList)


router
  .route('/create')
  .all(verifyToken)
  // .post(validate(taskValidations.createTask), TaskController.createTask);
  .post(TaskController.createTask);

router
  .route('/:taskId')
  .all(verifyToken)
  .get(validate(taskValidations.getTaskById), TaskController.getTaskById)
  // .put(validate(taskValidations.updateTask), TaskController.updateTask)
  .put(TaskController.updateTask)
  .delete(validate(taskValidations.deleteTask), TaskController.deleteTask);

module.exports = router;
