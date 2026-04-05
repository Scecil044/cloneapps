const { termsService } = require('../services')
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { toLower } = require('lodash');

const listAllTerms = catchAsync(async (req, res) => {
    try {
        const result = await termsService.listAllTerms()
        for (const doc of result) {
            if (doc && doc.name && toLower(doc.name) === "due end of the month") {
                const daysLeft = daysLeftUntilEndOfMonth();
                doc.days = daysLeft + 1
            }

            if (doc && doc.name && toLower(doc.name) === "due end of next month") {
                const daysLeft = daysLeftUntilEndOfNextMonth();
                doc.days = daysLeft + 1
            }
        }
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch Data', details: error });
    }
});

const createNewTerm = catchAsync(async (req, res) => {
    try {
        const result = await termsService.createNewTerm(req.body)
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to Create Term', details: error });
    }
});

// Function to get the number of days left until the end of the month
function daysLeftUntilEndOfMonth() {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysLeft = (endOfMonth - today) / (1000 * 60 * 60 * 24);
    return Math.floor(daysLeft);
}

// Function to get the number of days left until the end of next month
function daysLeftUntilEndOfNextMonth() {
    const today = new Date();
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    const daysLeft = (endOfNextMonth - today) / (1000 * 60 * 60 * 24);
    return Math.floor(daysLeft);
}


module.exports = {
    listAllTerms,
    createNewTerm
}