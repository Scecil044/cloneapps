const { Poc, EmailLog, Companies } = require('../models');
const { ObjectId } = require('mongodb');

const createNewPointOfContact = async (reqBody, userId) => {
  try {
    const { name, email, status = 'active', department, designation, phone, company_id, image_url } = reqBody;

    const pocBody = {
      name,
      email,
      status,
      department,
      designation,
      phone,
      company_id,
      role_ID: '640ecdfc4118771fa8e57002',
      created_by: userId
    };

    if (image_url) {
      pocBody.image_url = image_url;
    }

    const companyDoc = await Companies.findById(company_id);
    if (!companyDoc) {
      throw new Error('Could not create Point of Contact. Invalid company ID provided.');
    }

    // Ensure contact_persons is an array
    if (!Array.isArray(companyDoc.contact_persons)) {
      companyDoc.contact_persons = [];
    }

    const existingPoc = companyDoc.contact_persons.find(pointOfContact => pointOfContact.email === email);

    if (!existingPoc) {
      companyDoc.contact_persons.push({
        name,
        email,
        phone,
        designation
      });

      companyDoc.markModified('contact_persons');
    }

    const response = await Poc.create(pocBody);
    if (response) {
      await companyDoc.save();
    }

    return response;
  } catch (error) {
    throw error;
  }
};

const updatePointOfContact = async (reqBody, pocId, userId) => {
  try {
    const isPoc = await Poc.findById(pocId);
    if (!isPoc) {
      throw new Error('Point of Contact not found');
    }

    // Update the Poc document
    Object.keys(reqBody).forEach(key => {
      isPoc[key] = reqBody[key];
    });
    isPoc.updated_by = userId;

    // Update contact_persons inside the related company
    const companyDoc = await Companies.findById(isPoc.company_id);
    if (companyDoc && Array.isArray(companyDoc.contact_persons)) {
      const contactIndex = companyDoc.contact_persons.findIndex(contact => contact.email === isPoc.email);

      if (contactIndex !== -1) {
        const updatedContact = {
          ...companyDoc.contact_persons[contactIndex],
          name: reqBody.name || companyDoc.contact_persons[contactIndex].name,
          phone: reqBody.phone || companyDoc.contact_persons[contactIndex].phone,
          designation: reqBody.designation || companyDoc.contact_persons[contactIndex].designation,
          email: reqBody.email || companyDoc.contact_persons[contactIndex].email
        };

        companyDoc.contact_persons[contactIndex] = updatedContact;
        companyDoc.markModified('contact_persons');
        await companyDoc.save();
      }
    }

    return await isPoc.save();
  } catch (error) {
    throw error;
  }
};

const fetchPointOfContacts = async reqQuery => {
  try {
    const filter = {
      is_deleted: false
    };

    if (reqQuery.company && reqQuery.company !== 'all') {
      filter.company_id = ObjectId(reqQuery.company);
    }

    // Add status filter
    if (reqQuery.status && reqQuery.status !== 'all') {
      filter.status = reqQuery.status;
    }

    // Add department filter
    if (reqQuery.department && reqQuery.department !== 'all') {
      filter.department = reqQuery.department;
    }

    const searchRegex = reqQuery.search?.trim() ? new RegExp(reqQuery.search.trim(), 'i') : null;

    const options = {
      page: reqQuery.page ? parseInt(reqQuery.page, 10) : 1,
      limit: reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10,
      sortBy: typeof reqQuery.sort == 'string' ? reqQuery.sort : 'createdAt:desc'
    };

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add search filter after lookup/unwind if search is provided
    if (searchRegex) {
      pipeline.push({
        $match: {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { designation: searchRegex },
            { department: searchRegex },
            { 'companyDetails.company_name': searchRegex }
          ]
        }
      });
    }

    // Add a field to check if POC exists in company's contact_persons array and get its phone
    pipeline.push({
      $addFields: {
        matchingContactPerson: {
          $filter: {
            input: { $ifNull: ['$companyDetails.contact_persons', []] },
            as: 'contactPerson',
            cond: { $eq: ['$$contactPerson.email', '$email'] }
          }
        }
      }
    });

    // Add a field with the preferred phone number (from contact_persons if available, otherwise from POC)
    pipeline.push({
      $addFields: {
        preferredPhone: {
          $cond: {
            if: { $gt: [{ $size: '$matchingContactPerson' }, 0] },
            then: { $arrayElemAt: ['$matchingContactPerson.phone', 0] },
            else: '$phone'
          }
        }
      }
    });

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phone: '$preferredPhone', // Use the preferred phone number
        alt_phone: 1,
        designation: 1,
        department: 1,
        createdAt: 1,
        updatedAt: 1,
        image_url: 1,
        status: 1,
        company_id: 1,
        work_country: 1,
        work_city: 1,
        address: 1,
        companyDetails: {
          _id: '$companyDetails._id',
          company_name: '$companyDetails.company_name'
        },
        createdBy: {
          _id: '$createdBy._id',
          first_name: '$createdBy.first_name',
          last_name: '$createdBy.last_name',
          email: '$createdBy.email',
          image_url: '$createdBy.image_url'
        }
      }
    });

    const response = await Poc.paginateLookup(filter, options, pipeline);
    return response;
  } catch (error) {
    throw error;
  }
};

const getPointsOfContactStats = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          is_deleted: false
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { status: 'active' } }, { $count: 'count' }],
          inactive: [{ $match: { $or: [{ status: { $ne: 'active' } }, { status: null }] } }, { $count: 'count' }],
          byDepartment: [
            {
              $group: {
                _id: '$department',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                department: '$_id',
                count: 1,
                _id: 0
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          byCompany: [
            {
              $group: {
                _id: '$companyDetails.company_name',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                company_name: '$_id',
                count: 1,
                _id: 0
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ],
          recentlyAdded: [{ $match: { createdAt: { $gte: thirtyDaysAgo } } }, { $count: 'count' }],
          missingEmail: [
            { $match: { $or: [{ email: { $exists: false } }, { email: '' }, { email: null }] } },
            { $count: 'count' }
          ],
          missingPhone: [
            { $match: { $or: [{ phone: { $exists: false } }, { phone: '' }, { phone: null }] } },
            { $count: 'count' }
          ],
          escalationPOC: [{ $match: { department: 'Escalation Point of Contact' } }, { $count: 'count' }],
          financialPOC: [{ $match: { department: 'Financial Point of Contact' } }, { $count: 'count' }],
          hrPOC: [{ $match: { department: 'HR Point of Contact' } }, { $count: 'count' }]
        }
      }
    ];

    const result = await Poc.aggregate(pipeline);
    const stats = result[0];

    return {
      total: stats.total[0]?.count || 0,
      active: stats.active[0]?.count || 0,
      inactive: stats.inactive[0]?.count || 0,
      byDepartment: stats.byDepartment || [],
      byCompany: stats.byCompany || [],
      recentlyAdded: stats.recentlyAdded[0]?.count || 0,
      missingEmail: stats.missingEmail[0]?.count || 0,
      missingPhone: stats.missingPhone[0]?.count || 0,
      escalationPOC: stats.escalationPOC[0]?.count || 0,
      financialPOC: stats.financialPOC[0]?.count || 0,
      hrPOC: stats.hrPOC[0]?.count || 0
    };
  } catch (error) {
    throw error;
  }
};

const fetchPocEmails = async reqBody => {
  try {
    const filter = {
      to: { $in: [reqBody.email] },
      cc: { $in: [reqBody.email] }
    };
    const options = {
      sortBy: reqBody.sort || '_id:-1',
      page: reqBody.page ? parseInt(reqBody.page, 10) : 1,
      limit: reqBody.limit ? parseInt(reqBody.limit, 10) : 10
    };
    const response = await EmailLog.paginate(filter, options);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNewPointOfContact,
  updatePointOfContact,
  fetchPointOfContacts,
  getPointsOfContactStats,
  fetchPocEmails
};
