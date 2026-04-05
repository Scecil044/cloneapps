const { News, CoreConfig, Users } = require('../models');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const { sendEmail } = require('../middlewares/email');

// Create a new News
const createNewNews = async (reqBody, created_by) => {
  const body = { ...reqBody, created_by: created_by };
  const newNewsItem = await News.create(body );
  if (!newNewsItem) return { message: 'Unable to Create the News. Please check your input.', data: [] };
  return { message: 'Success', data: newNewsItem };
};

// Create a new News
const createBulkNews = async (reqBody, created_by) => {
  const { data, companies } = reqBody;
  const operations = data.flatMap(newsData =>
    companies.map(companyId => ({ insertOne: { document: { ...newsData, created_by, company_ID: ObjectId(companyId) } } }))
  );

  const announcementByEmailList = data.flatMap(newsData => {
    if (newsData?.send_by_email) {
      delete newsData.send_by_email;
      return companies.map(companyId => {
        return {
          company_ID: ObjectId(companyId),
          news: newsData,
          from_email: newsData?.from_email ?? 'donotreply@nathanhr.ae'
        };
      });
    }
  });

  try {
    const result = await News.bulkWrite(operations, { ordered: false });
    if (result.insertedCount === 0) {
      return { message: 'Unable to create news. Please check your input.', data: [] };
    }
    for (const emailAnnouncement of announcementByEmailList) {
      const employees = await Users.find({ company_ID: emailAnnouncement.company_ID, email: { $ne: null } }, { email: 1 });
      let emailList = employees.map(employee => employee.email);
      if (emailList.length > 0) {
        await sendEmail(
          emailList,
          emailAnnouncement.news.title,
          emailAnnouncement.news.short_desc,
          [],
          [],
          emailAnnouncement.from_email
        );
      }
    }
    return { message: 'Success', data: result.insertedIds };
  } catch (error) {
    console.error('Error creating news:', error);
    return { message: 'Unable to create news. Please check your input.', data: [] };
  }
};

// Get All News
const getAllNews = async reqBody => {
  const currentDate = new Date(moment().format('YYYY-MM-DD'));
  const match = { delete: false, ...reqBody?.condition };
  if (reqBody.company_ID) match.company_ID = { $in: [reqBody?.company_ID, ObjectId(reqBody?.company_ID)] };
  const requests = await News.aggregate([
    {
      $match: {
        $or: [{ permanent: true }, { permanent: false, from: { $lte: currentDate }, to: { $gte: currentDate } }]
      }
    },
    { $match: { ...match } },
    { $sort: { _id: -1 } },
    { $skip: parseInt(reqBody?.skip) },
    { $limit: parseInt(reqBody?.limit) },
    { $project: reqBody?.project }
  ]);
  if (!requests || requests.length === 0) return { message: 'No news to Display', data: [] };
  requests.forEach(element => {
    //TODO - use he
    if (element?.short_desc && typeof element?.short_desc === 'string') {
      element.short_desc = element.short_desc?.replace(/&lt;/g, '<');
      element.short_desc = element.short_desc?.replace(/&gt;/g, '>');
    }
  });
  return { message: 'Success', data: requests };
};

// List All News
const listAllNews = async reqBody => {
  const match = { delete: false, ...reqBody?.condition };
  if (reqBody.company_ID) match.company_ID = { $in: [reqBody?.company_ID, ObjectId(reqBody?.company_ID)] };
  const requests = await News.aggregate([
    { $match: { ...match } },
    { $sort: { _id: -1 } },
    { $skip: parseInt(reqBody?.skip) },
    { $limit: parseInt(reqBody?.limit) },
    { $project: reqBody?.project }
  ]);
  if (!requests || requests.length === 0) return { message: 'No news to Display', data: [] };
  requests.forEach(element => {
    //TODO - use he
    if (element?.short_desc && typeof element?.short_desc === 'string') {
      element.short_desc = element.short_desc?.replace(/&lt;/g, '<');
      element.short_desc = element.short_desc?.replace(/&gt;/g, '>');
    }
  });
  return { message: 'Success', data: requests };
};

// Update News On ID
const updateNewsOnId = async (newsId, reqBody, userId) => {
  const updateBody = {
    ...reqBody,
    updated_by: userId
  };
  const updatedNews = await News.findOneAndUpdate({ _id: ObjectId(newsId) }, { $set: updateBody }, {new: true});
  if (!updatedNews) {
    return { message: 'Unable to Update News. Please check your input. ', data: [] };
  }
  return { message: 'Success', data: updatedNews };
};

const listAllCompanyNews = async () => {
  try {
    const requests = await News.aggregate([
      { $match: { delete: false } },
      {
        $group: {
          _id: '$company_ID',
          news: { $push: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'companies', 
          localField: '_id',
          foreignField: '_id',
          as: 'companyDetails' 
        }
      },
      {
        $unwind: '$companyDetails'
      },
      {
        $project:{
            company_name: '$companyDetails.company_name',
            logo: '$companyDetails.logo', 
            news: 1
        }
      }
    ]);

    if (!requests || requests.length === 0) {
      return { message: 'No news to Display', data: [] };
    }

    requests.forEach(company => {
      company.news.forEach(newsItem => {
        if (newsItem.short_desc && typeof newsItem.short_desc === 'string') {
          newsItem.short_desc = newsItem.short_desc.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
      });
    });

    return { message: 'Success', data: requests };
  } catch (error) {
    console.error('Error in getAllNewsFromAllCompanies:', error);
    return { message: 'Failed to list all news', error };
  }
};

module.exports = {
  createNewNews,
  createBulkNews,
  getAllNews,
  listAllNews,
  updateNewsOnId,
  listAllCompanyNews
};
