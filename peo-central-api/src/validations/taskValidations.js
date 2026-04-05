const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTask = {
  body: Joi.object().keys({
    due_date: Joi.date().required(),
    processId: Joi.string().custom(objectId).required().messages({
      'any.required': 'Process ID is required',
      'string.empty': 'Process ID is required',
    }),
    leadId: Joi.string().custom(objectId).required().messages({
      'any.required': 'Lead ID is required',
      'string.empty': 'Lead ID is required',
    }),
    user_id: Joi.string().custom(objectId).required().messages({
      'any.required': 'Assigned To ID is required',
      'string.empty': 'Assigned To ID is required',
    }),
    title: Joi.string().required().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty',
    }),
    description: Joi.string().allow('').messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
    }),
    follow_up: Joi.string().allow('').messages({
      'string.base': 'Follow Up must be a string',
      'string.empty': 'Follow Up cannot be empty',
    }),
    status: Joi.string().valid('pending', 'in progress', 'completed').default('pending').messages({
      'any.only': 'Status must be one of "pending", "in progress", or "completed"',
    }),
    start_time: Joi.string().allow('').messages({
      'string.base': 'start_time must be a string',
      'string.empty': 'start_time cannot be empty',
    }),
    processName: Joi.string()
      .valid(
        'Contact Client',
        'Lead Received',
        'Send Proposal',
        'Waiting for Approval',
        'Collect Documents',
        'Service Agreement'
      )
      .default('Contact Client')
      .messages({
        'any.only':
          'Process Name must be one of "Contact Client", "Lead Received", "Send Proposal", "Waiting for Approval", "Collect Documents", or "Service Agreement"',
      }),
  }),
};

const deleteTask = {
    params: Joi.object().keys({
        taskId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Task ID is required',
            'string.empty': 'Task ID cannot be empty'
        })
    })
}

const updateTask = {
    params: Joi.object().keys({
        taskId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Task ID is required',
            'string.empty': 'Task ID cannot be empty'
        })
    }),
    body: Joi.object().keys({
        title: Joi.string().required().messages({
            'any.required': 'Title is required',
            'string.empty': 'Title cannot be empty'
        }),
        update_reason: Joi.string().optional().allow(null, ''),
        description: Joi.string().allow('').messages({
            'string.base': 'Description must be a string',
            'string.empty': 'Description cannot be empty'
        }),
        due_date: Joi.date().required().messages({
            'any.required': 'Due Date is required',
            'date.base': 'Due Date must be a valid date'
        }),
        status: Joi.string().valid('pending', 'in progress', 'completed').default('pending').messages({
            'any.only': 'Status must be one of "pending", "in progress", or "completed"'
        }),
        processName: Joi.string().valid('Contact Client', 'Send Proposal', 'Waiting for Approval', 'Collect Documents', 'Service Agreement').default('Contact Client').messages({
            'any.only': 'Process Name must be one of "Contact Client", "Send Proposal", "Waiting for Approval", "Collect Documents", or "Service Agreement"'
        }),
        follow_up: Joi.string().allow('').messages({
            'string.base': 'Follow Up must be a string',
            'string.empty': 'Follow Up cannot be empty'
        }),
        user_id: Joi.string().custom(objectId).required().messages({
            'any.required': 'Assigned To ID is required',
            'string.empty': 'Assigned To ID cannot be empty'
        }),
        processId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Process ID is required',
            'string.empty': 'Process ID cannot be empty'
        }),
        leadId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Lead ID is required',
            'string.empty': 'Lead ID cannot be empty'
        }),
    })
}
const  getTaskById = {
    params: Joi.object().keys({
        taskId: Joi.string().custom(objectId).required().messages({
            'any.required': 'Task ID is required',
            'string.empty': 'Task ID cannot be empty'
        })
    })
}

const fetchTasks = {
    params: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1).optional().messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1'
        }),
        limit: Joi.number().integer().min(1).max(100).default(10).optional().messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit must not exceed 100'
        }),
        sort: Joi.string().optional().messages({
            'string.base': 'Sort must be a string',
            'string.empty': 'Sort cannot be empty'
        }),
        leadId: Joi.string().custom(objectId).optional().messages({
            'string.base': 'Lead ID must be a string',
            'string.empty': 'Lead ID cannot be empty'
        }),
        search: Joi.string().optional().allow("").default("")
    }),
    body: Joi.object().keys({
        leadId: Joi.string().custom(objectId).optional().messages({
            'string.base': 'Lead ID must be a string',
            'string.empty': 'Lead ID cannot be empty'
        }),
        processId: Joi.string().custom(objectId).optional().messages({
            'string.base': 'Process ID must be a string',
            'string.empty': 'Process ID cannot be empty'
        }),
        status: Joi.string().valid('pending', 'in progress', 'completed').optional().messages({
            'any.only': 'Status must be one of "pending", "in progress", or "completed"'
        }),
    })
}
module.exports = {
    createTask,
    deleteTask,
    updateTask,
    getTaskById,
    fetchTasks
}
