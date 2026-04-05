const Joi = require('joi');
const { objectId } = require('./custom.validation');

const updateProductsAndServices ={
    body: Joi.object().keys({
        products_and_services: Joi.array().items({
            name: Joi.string().required(),
            description: Joi.string().required(),
        }).required(),
    })
};

module.exports = {
    updateProductsAndServices
}