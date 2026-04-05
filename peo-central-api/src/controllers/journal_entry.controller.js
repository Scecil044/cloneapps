const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { journalEntryService } = require('../services');
const ApiError = require('../utils/ApiError');
const { ObjectId } = require('mongodb');

const createInvoiceJournalEntry = async (data, user) => {
    const result = await generateJournalEntry(data)
    return result
}

const generateJournalEntry = async (data) => {
    try {
        let newJournalNumber;
        const lastJournalNumber = await journalEntryService.getLastJournalEntry();
        if (!lastJournalNumber) {
            newJournalNumber = 'JN-0001';
        } else {
            let currentNum = parseInt(lastJournalNumber.journal_number.split('-')[1]);
            let nextNum = currentNum + 1;
            let leadingZeros = '0'.repeat(4 - nextNum.toString().length);
            newJournalNumber = 'JN-' + leadingZeros + nextNum;
        }
        data.journal_number = newJournalNumber;
        console.log("creating js from journal entry controller");

        // Set a timeout to ensure the operation doesn't hang indefinitely
        const result = await Promise.race([
            journalEntryService.createJournalEntry(data),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Journal entry creation timed out')), 60000)
            )
        ]);

        console.log("Journal entry created successfully");
        return result;
    } catch (error) {
        console.error('Error in generateJournalEntry:', error);
        // Return a partial success response with error info
        // This ensures the API doesn't time out even if there's an issue
        return {
            error: true,
            message: 'Journal entry creation encountered an issue',
            details: error.message
        };
    }
};

module.exports = {
    createInvoiceJournalEntry,
    generateJournalEntry
};
