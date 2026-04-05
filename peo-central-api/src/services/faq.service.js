const { Faq } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const getFaqById = async faqId => {
  const faq = await Faq.findOne({ is_deleted: false, _id: faqId });

  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find FAQ');
  }

  return faq;
};

const createFaq = async (reqBody, userId) => {
  const newFaq = await Faq.create({
    question: reqBody.question,
    answer: reqBody.answer,
    createdBy: userId,
    updatedBy: userId,
    category:reqBody.category,
    tags: reqBody.tags || []
  });

  return newFaq;
};

const updateFaqById = async (faqId, reqBody, userId) => {
  const iseExistingFaq = await getFaqById(faqId);
  if (!iseExistingFaq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }

  const updates = Object.keys(reqBody);

  updates.forEach((update) => {
    iseExistingFaq[update] = reqBody[update];
  });

  iseExistingFaq.updatedBy = userId;
  await iseExistingFaq.save();
  return iseExistingFaq;
};

const deleteFaq = async (faqId, userId) => {
  const existingFaq = await getFaqById(faqId);
  if (!existingFaq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find FAQ by the provided id');
  }

  // Set the is_deleted field to false
  existingFaq.is_deleted = true;

  existingFaq.updatedBy = userId;

  await existingFaq.save();
  return existingFaq;
};

const filterFaqs = async (reqQuery) => {
  try {
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 50;
    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const sort = reqQuery.sort ? parseInt(reqQuery.sort) : -1;
    const sortBy = reqQuery.sortBy || 'createdAt';
    const skip = (page - 1) * limit;

    // Base match criteria
    const matchStage = { is_deleted: false };

    if (reqQuery.search) {
      const searchRegex = new RegExp(reqQuery.search, 'i');
      matchStage.$or = [
        { question: { $regex: searchRegex } },
        { answer: { $regex: searchRegex } },
        { category: { $regex: searchRegex } }
      ];
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users', // Changed to lowercase
          localField: 'createdBy',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true // This will keep documents even if no user is found
        }
      },
      {
        $project: {
          _id: 1,
          question: 1,
          answer: 1,
          category: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            $cond: {
              if: { $ifNull: ['$userDetails', false] },
              then: {
                first_name: '$userDetails.first_name',
                last_name: '$userDetails.last_name',
                email: '$userDetails.email'
              },
              else: null
            }
          }
        }
      },
      { $sort: { [sortBy]: sort } },
      { $skip: skip },
      { $limit: limit }
    ];

    const response = await Faq.aggregate(pipeline);

    // If the response is empty, let's check why
    if (response.length === 0) {
      const count = await Faq.countDocuments(matchStage);
      console.log(`Total matching documents: ${count}`);
      if (count > 0) {
        console.log(`Skipped ${skip} documents, limit is ${limit}`);
      }
    }

    return response;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};


const filterFaqsByCategory = async (reqQuery) => {
  try {
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 50;
    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const sort = reqQuery.sort ? parseInt(reqQuery.sort) : -1;
    const sortBy = reqQuery.sortBy || 'createdAt';
    const skip = (page - 1) * limit;

    // Create a search query object
    const searchQuery = {};

    // If search parameter is provided, add regex search for category
    if (reqQuery.search) {
      searchQuery.category = { $regex: new RegExp(reqQuery.search, 'i') };
    }

    // Perform the database query
    const faqs = await Faq.find(searchQuery)
      .sort({ [sortBy]: sort })
      .skip(skip)
      .limit(limit);

    // Get total count of documents matching the search criteria
    const totalCount = await Faq.countDocuments(searchQuery);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return {
      faqs,
      currentPage: page,
      totalPages,
      totalCount
    };
  } catch (error) {
    console.error('Error in filterFaqsByCategory:', error);
    throw new Error('Failed to filter FAQs by category');
  }
};



module.exports = {
  getFaqById,
  createFaq,
  updateFaqById,
  deleteFaq,
  filterFaqs,
  filterFaqsByCategory,
};
