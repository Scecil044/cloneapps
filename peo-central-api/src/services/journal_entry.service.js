const { JournalEntry } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');

// const createJournalEntry = async (body) => {
//     try {
//         const journalEntry = await JournalEntry.create(body);
//         if(journalEntry){
//             console.log(journalEntry._id, "this is the created JE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
//         }
//         console.log("returning journal entry")
//         return { journalEntry };
//     } catch (error) {
//         console.error('Error creating journal entry:', error);
//         throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create journal entry');
//     }
// };
const createJournalEntry = async (body) => {
    try {
        console.time('JournalEntry.create');
        const journalEntry = await JournalEntry.create(body);
        console.timeEnd('JournalEntry.create');
        if (journalEntry) {
            console.log(journalEntry._id, "this is the created JE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        }
        console.log("returning journal entry")
        return { journalEntry };
    } catch (error) {
        console.error('Error creating journal entry:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create journal entry');
    }
};

const createJournalEntryWithSession = async (body, session) => {
    try {
        console.time('JournalEntry.createWithSession');
        const journalEntry = await JournalEntry.create([body], { session });
        console.timeEnd('JournalEntry.createWithSession');
        if (journalEntry && journalEntry.length > 0) {
            console.log(journalEntry[0]._id, "this is the created JE with session!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        }
        console.log("returning journal entry with session")
        return { journalEntry: journalEntry[0] };
    } catch (error) {
        console.error('Error creating journal entry with session:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create journal entry with session');
    }
};
const getLastJournalEntry = async (filter) => {
    const latestDoc = await JournalEntry.aggregate([
        {
            $project: {
                _id: 1,
                journal_number: 1
            }
        },
        {
            $sort: {
                _id: -1
            }
        },
        {
            $limit: 1
        }
    ])

    return latestDoc[0]
};

const getJournalByInvoice = async (id) => {
    const journalInfo = await JournalEntry.findOne({ invoice: ObjectId(id) });
    return journalInfo
};

const updateJournalEntry = async (id, updateBody) => {
    const journalEntry = await getJournalById(id);
    if (!journalEntry) {
        throw new ApiError(httpStatus.NOT_FOUND, 'record not found');
    }
    Object.assign(journalEntry, updateBody);
    await journalEntry.save();
    return journalEntry;
};

const getJournalById = async (id) => {
    const journalEntry = await JournalEntry.findById(id);
    return journalEntry;
};

const deleteLastJournalData = async (id) => {
    const journalInfo = await JournalEntry.find({ invoice: ObjectId(id) }).sort({ '_id': -1 }).limit(1)
    let journal_id = journalInfo[0]._id
    const journalEntry = await getJournalById(journal_id);
    Object.assign(journalEntry, { is_deleted: 1 });
    await journalEntry.save();
    return journalEntry;
};

module.exports = {
    getLastJournalEntry,
    createJournalEntry,
    createJournalEntryWithSession,
    getJournalByInvoice,
    updateJournalEntry,
    deleteLastJournalData
};
