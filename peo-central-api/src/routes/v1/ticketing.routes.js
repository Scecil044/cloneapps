const express = require('express');
const validate = require('../../middlewares/validate');

const router = express.Router();
const { ticketsController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');
const { ticketValidations } = require('../../validations');
const checkRole = require('../../middlewares/roleValidations');

// You can optionally use this route to filter tickets
router
  .route('/')
  .all(verifyToken) // checkRole(['admin', 'super Admin', 'Employee', 'Finance Manager', 'Manager', 'CEO', 'HR Manager'])
  .get(ticketsController.getAllTickets);

router
  .route('/ticketId/:ticketId')
  .all(verifyToken)
  .get(validate(ticketValidations.getticketByTicketId), ticketsController.ticketById);

router.route('/companyId/:companyId').all(verifyToken).get(ticketsController.ticketsbyCompanyId);

router.route('/assigned/tickets/:userId').all(verifyToken).get(ticketsController.getAssignedTickets);

router.route('/stats').all(verifyToken).get(ticketsController.ticketStats);
router.route('/test').all(verifyToken).post(ticketsController.sendSampleNotification);

router.route('/userId/:userId').all(verifyToken).get(ticketsController.ticketByUserId);

router.route('/read/ticket/:ticketId').all(verifyToken).put(ticketsController.markChatAsRead);

router
  .route('/reassign/ticket/:ticketId')
  .all(verifyToken)
  .put(validate(ticketValidations.reassignTicket), ticketsController.reassignTicket);

router.route('/').all(verifyToken).post(validate(ticketValidations.raiseTicket), ticketsController.createTicket);

router.route('/remove/attachments/:ticketId/:messageId').put(ticketsController.removeAttachmentsFromTicketMessage);

router
  .route('/update/:ticketId/:messageId')
  .all(verifyToken)
  .put(validate(ticketValidations.updateTicketMessage), ticketsController.updateTicketMessageByTicketIdAndMessageId);

router
  .route('/update/:ticketId')
  .all(verifyToken)
  .put(validate(ticketValidations.updateTicket), ticketsController.updateTicketByTicketId);

router
  .route('/complete/:ticketId')
  .all(verifyToken)
  .put(validate(ticketValidations.completeTicket), ticketsController.marckTicketAsComplete);

router
  .route('/attend/to/ticket/:ticketId')
  .all(verifyToken)
  .put(validate(ticketValidations.attendToTicket), ticketsController.attendToTicket);

router.route('/:ticketId').all(verifyToken).delete(validate(ticketValidations.deleteTicket), ticketsController.deleteById);

module.exports = router;
