const Joi = require('joi');

/**
 * ============================================================================================
 
 * While these routes work correctly,
 * their respective validators have not been completely integrated on routes.
 
 * ============================================================================================
 */

const readAllUserNotification = {
  params: Joi.object().keys({
    freelancer_id: Joi.string().required()
  })
};

const createNewNotification = {
  body: Joi.object().keys({
    notification_text: Joi.string().required(),
    notification_type: Joi.string().required(),
   
  }),
};

module.exports = {
  readAllUserNotification,
  createNewNotification,
};
