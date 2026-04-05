const Joi = require('joi');
const { objectId } = require('./custom.validation');

const attendToTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId)
  })
};
const getticketByTicketId = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId)
  })
};

const raiseTicket = {
  body: Joi.object().keys({
    // company_id: Joi.required().custom(objectId),
    participants: Joi.array().items(Joi.string().custom(objectId)).default([]),
    company_id: Joi.string().custom(objectId),
    content: Joi.string().allow(''),
    lastMessage: Joi.string().allow(''),
    lastMessageTime: Joi.date().default(Date.now),
    status: Joi.string().valid('New', 'Ongoing', 'Completed').default('New'),
    type: Joi.string()
      .valid(
        'Application Status',
        'Invoice',
        'Letter Request',
        'Clients',
        'Renewal',
        'Medical Insurance',
        'Modification',
        'Sponsorship',
        'Agreement',
        'Miscellaneous',
        'Cancellation',
        'Other'
      )
      .required(),
    rating: Joi.string().valid('1', '2', '3', '4', '5').allow(null),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    anonymous: Joi.string().valid('Yes', 'No').default('No'),
    completed_by: Joi.object()
      .keys({
        first_name: Joi.string().allow(''),
        last_name: Joi.string().allow(''),
        email: Joi.string().email().allow(''),
        _id: Joi.string().allow('')
      })
      .allow(null),
    // created_by: Joi.required().custom(objectId),
    ticketComments: Joi.array().items(Joi.array()).default([]),
    completion_date: Joi.date().allow(null),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now),
    is_deleted: Joi.boolean().default(false),
    assignToId: Joi.string().custom(objectId).allow(null),
  })
};

const completeTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId)
  })
};

const deleteTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId)
  })
};

const updateTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId)
  })
};

const updateTicketMessage = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId),
    messageId: Joi.required().custom(objectId)
  })
};
const reassignTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    assignToId: Joi.required().custom(objectId),
  })
};
module.exports = {
  attendToTicket,
  raiseTicket,
  completeTicket,
  updateTicket,
  updateTicketMessage,
  deleteTicket,
  getticketByTicketId,
  reassignTicket
};
