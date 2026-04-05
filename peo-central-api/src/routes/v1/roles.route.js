const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { rolesValidation } = require('../../validations');
const { roleController } = require('../../controllers');
const RoleModel = require('../../models/roles.model');

router
  .route('/')
  .all(verifyToken)
  .post(validate(rolesValidation.createRole), roleController.createRole)
  .get(roleController.listAllRoles);

router
  .route('/:roleId')
  .all(verifyToken)
  .get(validate(rolesValidation.roleById), roleController.roleById)
  .patch(validate(rolesValidation.updateRole), roleController.updateRole)
  .delete(validate(rolesValidation.roleById), roleController.deleteRole);

router.post('/filterkeys', async (req, res) => {
  try {
    const invoice = await RoleModel.find({ role_name: { $in: ['Employee', 'Administrator', 'Manager'] } }).select(
      'role_name'
    );
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
