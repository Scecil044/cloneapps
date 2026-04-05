const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { usersService, activityService, loggerService, searchService, tokenService, pointsOfContactsService } = require('../services');
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/logger');
const { Users, Companies } = require('../models');
const jwtDecode = require('jwt-decode');
const jwt = require('jsonwebtoken');
const config = require("../config/config")
const { tokenTypes } = require("../config/tokens")
const { ObjectId } = require('mongodb');
const ApiError = require('../utils/ApiError');
const fs = require("fs");
const excelJs = require("exceljs")

const fetchEmployeesByCompanyIdAndEmployment = catchAsync(async(req, res)=>{
  try{
    const response = await usersService.fetchEmployeesByCompanyIdAndEmployment(req.params.companyId, req.query);
    const logString = logger.info(`${req.userName} Accessed all the employees by company id and employment visa sponsor type route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  }catch(error){
    const logString = logger.error(`${req.userName} Failed to Access employees by company id and employment visa sponsor type => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get employees by company id and employment visa sponsor type', details: error?.message });
  }
})

const createInternalStaff = catchAsync(async(req, res)=>{
  try{
     const response = await usersService.createInternalStaff(req.body, req.userId);
    const logString = logger.info(`${req.userName} Accessed all route to create internal staff`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  }catch(error){
    const logString = logger.error(`${req.userName} Failed to Create Internal Staff, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Internal Staff. Please Check the Input', details: error?.message });
  }
})

const updateInternalStaff = catchAsync(async(req, res)=>{
  try{
     const response = await usersService.updateInternalStaff(req.body,req.params.userId, req.userId);
    const logString = logger.info(`${req.userName} Accessed  route to update internal staff`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  }catch(error){
    const logString = logger.error(`${req.userName} Failed to Update Internal Staff, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to update Internal Staff. Please Check the Input', details: error?.message });
  }
})

const updateUserProfile = catchAsync(async(req, res)=>{
  try{
    // Validate that req.userId is a valid ObjectId
    if (!req.userId || !ObjectId.isValid(req.userId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID in token');
    }

    // Check if user exists in Users collection first
    const { Users, Poc } = require('../models');
    let user = await Users.findById(req.userId).select('_id first_name last_name email').exec();
    let isPocUser = false;

    if (!user) {
      // If not found in Users, check POC collection
      user = await Poc.findById(req.userId).select('_id name email').exec();
      isPocUser = true;
    }

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found in either Users or POC collection');
    }

    if (isPocUser) {
      // Handle POC user update
      const mappedBody = {
        name: `${req.body.firstName } ${req.body.lastName}`, // POC uses single 'name' field
        phone: req.body.phone,
        designation: req.body.designation || '',
        department: req.body.department,
        image_url: req.body.photoUrl
      };


      const response = await pointsOfContactsService.updatePointOfContact(mappedBody, req.userId, req.userId);
      const logString = logger.info(`${req.userName} Updated their POC profile`).transports[0].logString;
      await loggerService.createLogger('users', req.userId, logString);
      res.status(httpStatus.OK).json(response);
    } else {
      // Handle regular user update
      const mappedBody = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        phone: req.body.phone,
        department: req.body.department,
        image_url: req.body.photoUrl
      };

      console.log('User mapped body:', mappedBody);

      const response = await usersService.updateUserOnId(req.userId, mappedBody, req.userId, req.userName);
      const logString = logger.info(`${req.userName} Updated their user profile`).transports[0].logString;
      await loggerService.createLogger('users', req.userId, logString);
      res.status(httpStatus.OK).json(response);
    }
  }catch(error){

    const logString = logger.error(`${req.userName} Failed to update user profile => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to update user profile', details: error?.message });
  }
})

const fetchInternalEmployees = catchAsync(async(req, res)=>{
  try{
    const response = await usersService.fetchInternalEmployees(req.query);
    const logString = logger.info(`${req.userName} Accessed all the internal employees route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  }catch(error){
    const logString = logger.error(`${req.userName} Failed to Access internal employees => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get internal employees', details: error?.message });
  }
})

const userStatusDistribution = catchAsync(async(req, res)=>{
  try{
    const response = await usersService.userStatusDistribution(req.body);
    const logString = logger.info(`${req.userName} Accessed all the user status distribution count route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  }catch(error){
    const logString = logger.error(`${req.userName} Failed to Access user status distribution count => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get user status distribution', details: error?.message });
  }
});

const createUser = catchAsync(async (req, res) => {
  try {
    const escapeRegex = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters for regex
    };
    const generateCompanyCode = (companyName) => {
      const words = companyName.split(' ').filter(Boolean);
      if (words.length === 1) {
        return words[0].toUpperCase();
      }

      const firstWord = words[0].toUpperCase();
      const initials = words.slice(1)
        .map(word => word[0].toUpperCase())
        .join('');

      // Combine and remove special characters like parentheses
      return `${firstWord}/${initials.replace(/[^\w]/g, '')}`;
    };
    const generateUniqueReferenceNumber = async (company_id, company_name) => {
      let companyCode = 'GEN'; // Default code
      if (company_name) {
        companyCode = generateCompanyCode(company_name);
      } else if (company_id) {
        const company = await Companies.findById(company_id);
        if (company?.company_name) {
          companyCode = generateCompanyCode(company.company_name);
        }
      }

      // Escape special characters in the company code for regex
      const escapedCompanyCode = escapeRegex(companyCode);

      // Generate a unique reference number
      let uniqueString = `PEO-${escapedCompanyCode}`;
      const count = await Users.countDocuments({ reference_number: new RegExp(`^${uniqueString}`) });
      uniqueString += `-${String(count + 1).padStart(4, '0')}`;

      return uniqueString;
    };
    const companyDoc = await Companies.findById(req.body.company_id);
    if (!companyDoc) throw new Error('invalid company id');
    const referenceNumber = await generateUniqueReferenceNumber(req.body.company_id, companyDoc.company_name);
    req.body.reference_number = referenceNumber;
    const user = await usersService.createUser(req.body);
    const createdBy = await usersService.updateCreatedBy(user._id, req.userId);
    const logMessage = logUserCreation(req.userId, user);
    const addActivityLog = await activityService.createActivity(req.userId, user._id, 'users', {}, user, {}, logMessage);
    const logString = logger.info(`${req.userName} Created a User with ID ${user._id}`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Create User, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to create User. Please Check the Input', details: error });
  }
});

function logUserCreation(userId, user) {
  const logMsg = `User ${userId} Created User ${user._id}`;
  return logMsg;
}

const getAllUser = catchAsync(async (req, res) => {
  try {
    const user = await usersService.getAllUsers(req.query, req.body);
    const logString = logger.info(`${req.userName} Accessed all the Users`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(user);
  } catch (error) {
    console.log({ error });
    const logString = logger.error(`${req.userName} Failed to Access All the Users, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All the Users', details: error });
  }
});

const getAllSupportAgents = catchAsync(async (req, res) => {
  try {
    const user = await usersService.getAllSupportAgents();
    const logString = logger.info(`${req.userName} Accessed all the Support Agents`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Support Agents, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All the Support Agents', details: error });
  }
}
);

/**
 * This function returns all users with all other roles except employees
 * Its implementation facilitates the mentions functionality on visaProcess comments
 */
// const getAllNonEmployees = catchAsync(async (req, res) => {
//   try {
//     const nonEmployees = await usersService.getNonEmployees();
//     const logString = logger.info(`${req.userName} Accessed all non-emplpyees`).transports[0].logString;
//     await loggerService.createLogger('users', req.userId, logString);
//     res.status(httpStatus.OK).send(nonEmployees);
//   } catch (error) {
//     const logString = logger.error(
//       `${req.userName} Failed to Access All non-employees, encountered following error => ${error}`
//     ).transports[0].logString;
//     await loggerService.createLogger('users', req.userId, logString);
//     res.status(400).json({ message: 'Failed to Fetch All non-employees', details: error });
//   }
// });

const countsOfDifferentUsersOnCompanyID = catchAsync(async (req, res) => {
  try {
    const user = await usersService.countsOfDifferentUsersOnCompanyID(req.params.companyId);
    const logString = logger.info(`${req.userName} Accessed the Counts of Users on CompanyID`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All Counts of Users on CompanyID, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All Counts of Users on CompanyID', details: error });
  }
});

const getUserById = catchAsync(async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.userId);
    const logString = logger.info(`${req.userName} Accessed all the Users with UserID - ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get User with UserID - ${req.params.userId}, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    console.log(error)
    res.status(400).json({ message: `Failed to Fetch User with the ID ${req.params.userId}`, details: error?.message });
  }
});

const getUserByEmail = catchAsync(async (req, res) => {
  try {
    const user = await usersService.getUserByEmail(req.params.email);
    const logString = logger.info(`${req.userName} Accessed all the Users with Email - ${req.params.email}`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Users with Email - ${req.params.email}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch the User for the given Email ', details: error });
  }
});

const usersOnCompanyID = catchAsync(async (req, res) => {
  try {
    const user = await usersService.usersOnCompanyID(req.params.companyId);
    const logString = logger.info(`${req.userName} Accessed all the Users with CompanyID - ${req.params.companyId}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Users with CompanyID - ${req.params.companyId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch the User for the given CompanyID ', details: error });
  }
});

const updateUserOnId = catchAsync(async (req, res) => {
  try {
    const existingUserbyID = await usersService.getUserById(req.params.userId);
    const updatedUser = await usersService.updateUserOnId(req.params.userId, req.body, req.userId, req.userName);
    const updatedBy = await usersService.updateUpdatedBy(req.params.userId, req.userId);
    const updatedFields = diff(existingUserbyID, updatedUser);
    const logMessage = logUserUpdates(req.userId, existingUserbyID, updatedUser, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.userId,
      'users',
      existingUserbyID,
      updatedUser,
      updatedFields,
      logMessage
    );
    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot update User');
    }
    const logString = logger.info(`${req.userName} Updated all the Users with UserId - ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(updatedUser);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update all the Users with UserId - ${req.params.userId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update User for the given ID ', details: error?.message });
  }
});

function logUserUpdates(userId, oldDoc, updatedUser, updatedFields) {
  const logMsg = `User ${userId} updated User ${updatedUser._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedUser[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const deleteUserOnId = catchAsync(async (req, res) => {
  try {
    const existingUserbyID = await usersService.getUserById(req.params.userId);
    const updatedUser = await usersService.deleteUserOnId(req.params.userId);
    const updatedBy = await usersService.updateUpdatedBy(req.params.userId, req.userId);
    const logMessage = logUserDeletion(req.userId, updatedUser);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.userId,
      'users',
      existingUserbyID,
      {},
      {},
      logMessage
    );
    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete User');
    }
    const logString = logger.info(`${req.userName} Deleted all the Users with UserId - ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Delete all the Users with UserId - ${req.params.userId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Delete User for the given ID ', details: error });
  }
});

function logUserDeletion(userId, updatedUser) {
  const logMsg = `User ${userId} Deleted User ${updatedUser._id}`;
  return logMsg;
}

const userDetailsForEmpListingPage = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user = await usersService.userDetailsForEmpListingPage(req.body, page, limit);
    const logString = logger.info(`${req.userName} Accessed All the Employee Listing Data`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Employee Listing Data, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch the Users Details ', details: error });
  }
});

const userDetailsForEmpPageOnId = catchAsync(async (req, res) => {
  try {
    const user = await usersService.userDetailsForEmpPageOnId(req.params.userId, req.body);
    const logString = logger.info(`${req.userName} Accessed Employee Details On UserID - ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Failed to Access Employee Details On UserID - ${req.params.userId}, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.send(400).json({ message: 'Failed to fetch the User Details for the given ID', details: error?.message });
  }
});

const allUsersNameCompanyImg = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user = await usersService.allUsersNameCompanyImg(req.body, page, limit);
    const logString = logger.info(`${req.userName} Accessed Employee Name and Company Name`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Employee Name and Company Name, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.send(400).json({ message: 'Failed to fetch the User Details for the given ID', details: error });
  }
});

const countsOfDifferentUsers = catchAsync(async (req, res) => {
  try {
    const user = await usersService.countsOfDifferentUsers(req.body);
    const logString = logger.info(`${req.userName} Accessed the Counts of the Users/Employees`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Counts of the Users/Employees, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.send(400).json({ message: 'Failed to fetch the Counts', details: error });
  }
});

const validateLogin = catchAsync(async (req, res) => {
  try {
    const login = await usersService.userLogin(req.body);
    if (login) {
      const logString = logger.info(`${req.body.email} logged In Successfully`).transports[0].logString;
      await loggerService.createLogger('users', null, logString);
      res.status(200).json({ success: true, message: 'Success', data: login });
    } else {
      const logString = logger.error(`${req.body.email} Failed to login`).transports[0].logString;
      await loggerService.createLogger('users', null, logString);
      res.status(401).json({ success: false, message: 'Username or Password is wrong.', data: [] });
    }
  } catch (error) {
    const logString = logger.error(
      `${req.body.email} Login Validation Failed. Please Check your Credentials, error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', null, logString);
    throw new Error(error);
    // res.send(400).json({ message: 'Login Validation Failed. Please Check your Credentials', details: error });
  }
});

const mobileLogin = catchAsync(async (req, res) => {
  try {
    const login = await usersService.mobileLogin(req.body);
    if (login) {
      const logString = logger.info(`${req.body.email} logged In Successfully`).transports[0].logString;
      await loggerService.createLogger('users', null, logString);
      res.status(200).json({ success: true, message: 'Success', data: login });
    } else {
      const logString = logger.error(`${req.body.email} Failed to login`).transports[0].logString;
      await loggerService.createLogger('users', null, logString);
      res.status(401).json({ success: false, message: 'Username or Password is wrong.', data: [] });
    }
  } catch (error) {
    const logString = logger.error(
      `${req.body.email} Login Validation Failed. Please Check your Credentials, error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', null, logString);
    throw new Error(error?.message);
    // res.send(400).json({ message: 'Login Validation Failed. Please Check your Credentials', details: error });
  }
});

const ClientLoginFlow = catchAsync(async (req, res) => {
  try {
    const loginResponse = await usersService.ClientLoginFlow(req.body);
    if (!loginResponse) {
      throw new Error('Login Validation Failed. Please Check your Credentials');
    };
    res.status(200).json(loginResponse);
  } catch (error) {
    throw new Error(error);
  }
});
// const refreshToken = catchAsync(async (req, res) => {
//     try {
//         const user = await Users.findOne({ "_id": req.userId })
//         const tokens = await user.generateAuthTokens()
//         res.json({ tokens })
//     } catch (err) {
//         res.status(500).json({ message: err.message })
//     }
// })

const validateCentralLogin = catchAsync(async (req, res) => {
  try {
    await usersService.userCentralLogin(req.body).then(async (responseasync) => {
      const login = responseasync;
      if (login) {
        const logString = logger.info(`${req.body.email} logged In Successfully`).transports[0].logString;
        await loggerService.createLogger('users', null, logString);
        res.status(200).json({ success: true, message: 'Success', data: login });
      } else {
        const logString = logger.error(`${req.body.email} Failed to login`).transports[0].logString;
        await loggerService.createLogger('users', null, logString);
        res.status(401).json({ success: false, message: 'Username or Password is wrong.', data: [] });
      }
    });
  } catch (error) {
    const logString = logger.error(
      `${req.body.email} Login Validation Failed. Please Check your Credentials, error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', null, logString);
    res.send(400).json({ message: 'Login Validation Failed. Please Check your Credentials', details: error });
  }
});

const validateCentralValidation = catchAsync(async (req, res) => {
  console.log('validateCentralValidation');
  try {
    const login = await usersService.userCentralValidation(req.body);
    console.log(login, '--------login');
    if (login) {
      const logString = logger.info(`${req.body.email} central validation is Successful`).transports[0].logString;
      await loggerService.createLogger('users', null, logString);
      res.status(200).json({ success: true, message: 'Success', data: login });
    } else {
      const logString = logger.error(`${req.body.email} Failed to validate central`).transports[0].logString;
      await loggerService.createLogger('users', null, logString);
      res.status(401).json({ success: false, message: 'Please login again.', data: [] });
    }
  } catch (error) {
    const logString = logger.error(
      `${req.body.email} Login Validation Failed. Please Check your Credentials, error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', null, logString);
    res.send(400).json({ message: 'Login Validation Failed. Please Check your Credentials', details: error });
  }
});
const dynamicSearch = catchAsync(async (req, res) => {
  try {
    const searchResult = await usersService.dynamicSearch(req.body);
    res.status(httpStatus.CREATED).send(searchResult);
  } catch (error) {
    res.send(400).json({ message: 'Unable to Get the required Data', details: error });
  }
});

const usersOnStatus = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const users = await usersService.usersOnStatus(req.params.status, req.body, page, limit);
    if (!users) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Users');
    }
    const logString = logger.info(
      `${req.userName} Accessed All the Users with Status - ${req.params.status} (userID ${req.userId})`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(users);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Users with Status - ${req.params.status}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Users for the Given Status', details: error });
  }
});

const getUsersBetweenDatesAndStatus = catchAsync(async (req, res) => {
  const body = JSON.stringify(req.body);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const users = await usersService.getUsersBetweenDatesAndStatus(req.body, page, limit);
    const logString = logger.info(`${req.userName} Accessed All Users by filtering it on Dates / Status - ${body}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.json(users);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All Users by filtering it on Dates / Status - ${body}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(500).json({ message: 'No Data available for the given Filter' });
  }
});

const search = catchAsync(async (req, res) => {
  try {
    const searchResults = await searchService.searchAllCollections(req.body.value, req.body.module);
    const logString = logger.info(`${req.userName} Searched for ${req.body.value}`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.json(searchResults);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Search ${req.body.value}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(500).send('Error performing search');
  }
});

const listAllUsersDropDown = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const users = await usersService.listAllUsersDropDown(req.body, page, limit);
    const logString = logger.info(`${req.userName} Accessed All UserNames DropDown`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.json(users);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All UserNames DropDown, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(500).json({ message: 'Failed to Fetch the Data' });
  }
});

const usersOnCompanyIdListing = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const users = await usersService.usersOnCompanyIdListing(req.params.companyId, page, limit);
    const logString = logger.info(`${req.userName} Accessed All Users on CompanyID - ${req.params.companyId}`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.json(users);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All Users on CompanyID - ${req.params.companyId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw error;
    // res.status(500).json({ message: 'Failed to Fetch the Data' });
  }
});

const userListingSearchingFilteringAndPagination = catchAsync(async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const search = req.query.search || '';
    const users = await usersService.userListingSearchingFilteringAndPagination(req.body, page, limit, search);
    const logString = logger.info(
      `${req.userName} Accessed All list of users on users Listing along with filter and Searching`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.json(users);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All Users List, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw error?.message;
  }
});

const listOfUsersStatus = catchAsync(async (req, res) => {
  try {
    const result = await usersService.listOfUsersStatus(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Status');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Status of Users `).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Status of Users, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Status of Users ', details: error });
  }
});

const listOfAdminUsers = catchAsync(async (req, res) => {
  try {
    const result = await usersService.listOfAdminUsers(req.query);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unbale to getthe Data');
    }
    const logString = logger.info(`${req.userName} Accessed the list of admin Users`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get Data, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});

const getLogin = catchAsync(async (req, res) => {
  try {
    console.log("start of function")
    const result = await usersService.getLogin(req);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Login Details');
    }
    const logString = logger.info(`${req.userName} Accessed the Login`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get Data, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});

const syncDocs = catchAsync(async (req, res) => {
  try {
    const result = await usersService.syncDocs();
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unbale to getthe Data');
    }
    const logString = logger.info(`${req.userName} Accessed the list of admin Users`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get Data, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});

const ExcelData = catchAsync(async (req, res) => {
  try {
    const result = await usersService.ExcelReport(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unbale to fetch all Data');
    }
    const logString = logger.info(`${req.userName} Access users excel Report`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get Data, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});
const ExcelReportVisa = catchAsync(async (req, res) => {
  try {
    const result = await usersService.ExcelReportVisa(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unbale to fetch all Data');
    }
    const logString = logger.info(`${req.userName} Access users excel Report`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get Data, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});

const AllProList = catchAsync(async (req, res) => {
  try {
    const result = await usersService.getAllPro(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unbale to fetch all Data');
    }
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get PRO List, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});

const UserPaySlipPasswordCHecker = catchAsync(async (req, res) => {
  try {
    const result = await usersService.paySlipPasswordChecker(req.body);
    // console.log(result, "result")
    if (!result) {
      return res.status(200).json('user Not Found');
    }
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to fetch user Details, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});

const getUserDetailsForPaySlips = catchAsync(async (req, res) => {
  try {
    const result = await usersService.userDetails(req.params.id);
    if (!result) {
      return res.status(200).json('user Not Found');
    }
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to fetch user Details, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Data ', details: error });
  }
});

// Function to update missing user details
// Specifically, to update personal and emergency objects on user doc
const updateMissingUserDetails = catchAsync(async (req, res) => {

  const requiredFields = [
    "personal.personal_email",
    "personal.gender",
    "personal.address",
    "personal.marital_status",
    "emergency.name",
    "emergency.relationship",
    "emergency.email",
    "emergency.phone",
    "emergency.other_phone",
    "emergency_uae.name",
    "emergency_uae.relationship",
    "emergency_uae.email",
    "emergency_uae.phone",
    "emergency_uae.other_phone"
  ];

  const flattenObject = (obj, prefix = '') =>
    Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});

  const flatBody = flattenObject(req.body);
  const missingFields = requiredFields.filter((field) => !flatBody[field]);

  const token = req.headers.authorization.split(" ")[1]
  const verifiedToken = await tokenService.verifyToken(token, tokenTypes.UPDATE_MISSING_DETAILS);
  if (!verifiedToken) {
    return res.status(200).json('Token dicarded');
  }
  const user = await usersService.getUserById(ObjectId(verifiedToken.user))
  if (!user) {
    return res.status(200).json('userUser with matching id was found');
  }
  const result = await usersService.updateMissingDetails(user._id, req.body);
  if (!result) {
    return res.status(200).json('user Not Found');
  }
  res.status(httpStatus.OK).send(result);

});

// Function to return userId from request.userId
// The function decodes from authorization header and returns user id
const getAuthenticatedUserInfo = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]
  let verifiedToken;
  if (req.query.onboardingToken && req.query.onboardingToken === "true") {
    verifiedToken = await tokenService.verifyToken(token, tokenTypes.ONBOARDING);
  } else {
    verifiedToken = await tokenService.verifyToken(token, tokenTypes.UPDATE_MISSING_DETAILS);
  }
  if (!verifiedToken) {
    res.status(400).json({ message: 'Token not found ' });
  }
  let user
  if (verifiedToken.isOnboardingToken) {
    user = await Companies.findById(ObjectId(verifiedToken.user)).select('company_name email registration_number legal_name phone payroll_schedule');
  } else {
    user = await Users.findById(ObjectId(verifiedToken.user)).select("personal phone emergency email first_name last_name middle_name emergency_uae other_phone");
    if (!user) {
      return res.status(200).json('userUser with matching id was found');
    }
  }

  res.status(httpStatus.OK).send(user);

});

const addAdditionalCostsToUserOnId = catchAsync(async (req, res) => {
  try {
    const user = await usersService.addAdditionalCostsToUserOnId(req.params.userId, req.body);
    const logString = logger.info(`${req.userName} Accessed Employee Details On UserID - ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Employee Details On UserID - ${req.params.userId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.send(400).json({ message: 'Failed to fetch the User Details for the given ID', details: error });
  }
});

const tenancyAndResidenceAddressUpdate = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]
  const verifiedToken = await tokenService.verifyToken(token, tokenTypes.UPDATE_MISSING_DETAILS);
  if (!verifiedToken) {
    return res.status(200).json('Token dicarded');
  }
  const user = await usersService.getUserById(ObjectId(verifiedToken.user))
  if (!user) {
    return res.status(200).json('userUser with matching id was found');
  }
  const response = await usersService.tenancyAndResidenceAddressUpdate(req.body, user._id);
  if (!response) throw new Error(`Could not complete residency and tenancy details update`);

  res.status(httpStatus.OK).json(response);
});

const exportTenancyAndResidenceAddressUpdateData = catchAsync(async(req, res)=>{
  try{
      const buffer = await usersService.exportTenancyAndResidenceAddressUpdateData(req.query);

            if (!buffer) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to export tenancy and residency report!');
            }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=TenancyAndResidenceAddressUpdateData.xlsx');
        res.send(buffer);
  }catch(error){
    const logString = logger.error(`${req.userName} Failed to export Tenancy and Residence Address Update Data, encountered following error => ${error?.message}`);
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to export Tenancy and Residence Address Update Data', details: error?.message });
  }
})

// const exportTenancyAndResidencyUpdates = catchAsync(async (req, res) => {
//   // Define the aggregation pipeline
//   const aggregationPipeline = [
//     {
//       $match: {
//         $or: [
//           { "personal.ejari": { $exists: true, $ne: null } },
//           { "personal.dewa": { $exists: true, $ne: null } },
//           { "personal.titleDeed": { $exists: true, $ne: null } }
//         ]
//       }
//     },
//     {
//       $project: {
//         _id: 0,
//         userId: "$_id",
//         name: "$name",  // Assuming there is a name field
//         ejari: "$personal.ejari",
//         dewa: "$personal.dewa",
//         titleDeed: "$personal.titleDeed"
//       }
//     },
//     {
//       $addFields: {
//         documentCount: {
//           $sum: [
//             { $cond: [{ $ifNull: ["$ejari", false] }, 1, 0] },
//             { $cond: [{ $ifNull: ["$dewa", false] }, 1, 0] },
//             { $cond: [{ $ifNull: ["$titleDeed", false] }, 1, 0] }
//           ]
//         }
//       }
//     },
//     {
//       $sort: {
//         documentCount: -1  // Sorting by the number of documents (descending)
//       }
//     }
//   ];

//   // Run the aggregation on the User model
//   const users = await Users.aggregate(aggregationPipeline);

//   // Create a new workbook and worksheet
//   const workBook = new excelJs.Workbook();
//   const sheet = workBook.addWorksheet("Tenancy and Residency Updates");

//   // Define the columns for the Excel sheet
//   sheet.columns = [
//     { header: 'User ID', key: 'userId', width: 20 },
//     { header: 'Name', key: 'name', width: 30 },
//     { header: 'Ejari', key: 'ejari', width: 30 },
//     { header: 'Dewa', key: 'dewa', width: 30 },
//     { header: 'Title Deed', key: 'titleDeed', width: 30 },
//     { header: 'Document Count', key: 'documentCount', width: 20 }
//   ];

//   // Add the data to the worksheet
//   users.forEach(user => {
//     sheet.addRow(user);
//   });

//   // Set headers for file download
//   res.setHeader('Content-Disposition', 'attachment; filename=TenancyAndResidencyUpdates.xlsx');
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

//   // Write the workbook to the response
//   await workBook.xlsx.write(res);

//   // End the response
//   res.end();
// });

const exportTenancyAndResidencyUpdates = catchAsync(async (req, res) => {
  // Modify the aggregation pipeline to prefix Ejari and Dewa fields
  const aggregationPipeline = [
    {
      $match: {
        $or: [
          { "personal.ejari": { $exists: true, $ne: null } },
          { "personal.dewa": { $exists: true, $ne: null } },
          { "personal.titleDeed": { $exists: true, $ne: null } }
        ]
      }
    },
    {
      $project: {
        fullName: {
          $concat: [
            "$first_name",
            " ",
            { $ifNull: ["$middle_name", ""] },
            " ",
            "$last_name"
          ]
        },
        "Ejari Contract Number": "$personal.ejari.contractNumber",
        "Ejari Issue Date": "$personal.ejari.issueDate",
        "Ejari Expiration Date": "$personal.ejari.expirationDate",
        "Ejari Attachment": "$personal.ejari.attachment",
        "Dewa Account Number": "$personal.dewa.accountNumber",
        "Dewa Premises Number": "$personal.dewa.premisesNumber",
        "Dewa Attachment": "$personal.dewa.attachment",
        "Title Deed": "$personal.titleDeed.titleDeed",
        "Title Deed Attachment": "$personal.titleDeed.attachment"
      }
    }
  ];

  const users = await Users.aggregate(aggregationPipeline);

  const workBook = new excelJs.Workbook();
  const sheet = workBook.addWorksheet("Tenancy and Residency Updates");

  // Define columns with prefixed headers
  sheet.columns = [
    { header: 'Full Name', key: 'fullName', width: 30 },
    { header: 'Ejari Contract Number', key: 'Ejari Contract Number', width: 20 },
    { header: 'Ejari Issue Date', key: 'Ejari Issue Date', width: 15 },
    { header: 'Ejari Expiration Date', key: 'Ejari Expiration Date', width: 15 },
    { header: 'Ejari Attachment', key: 'Ejari Attachment', width: 30 },
    { header: 'Dewa Account Number', key: 'Dewa Account Number', width: 20 },
    { header: 'Dewa Premises Number', key: 'Dewa Premises Number', width: 20 },
    { header: 'Dewa Attachment', key: 'Dewa Attachment', width: 30 },
    { header: 'Title Deed', key: 'Title Deed', width: 20 },
    { header: 'Title Deed Attachment', key: 'Title Deed Attachment', width: 30 }
  ];

  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Apply styles to all cells
  const applyStylesToRow = (row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  };

  applyStylesToRow(headerRow);

  // Add data rows
  users.forEach((user) => {
    const row = sheet.addRow(user);
    applyStylesToRow(row);
  });

  // Auto-fit columns
  sheet.columns.forEach(column => {
    column.width = Math.max(column.width, 15);
  });

  // Set headers for file download
  res.setHeader('Content-Disposition', 'attachment; filename=TenancyAndResidencyUpdates.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  // Write the workbook to the response
  await workBook.xlsx.write(res);

  // End the response
  res.end();
});

const geSystemProList = catchAsync(async (req, res) => {
  try {
    const proList = await usersService.geSystemProList();
    const logString = logger.info(`${req.userName} Accessed system pro list route`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    return res.status(httpStatus.OK).json(proList);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access system pro list, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error(error);
  }
});

const updateSalary = catchAsync(async (req, res) => {
  try {
    console.log("updating salaries====>")
    const proList = await usersService.updateSalary();
    if (!proList) throw new Error("could not complete action");
    // const logString = logger.info(`${req.userName} Accessed the update salaries route`).transports[0]
    //   .logString;
    // await loggerService.createLogger('users', req.userId, logString);
    return res.status(httpStatus.OK).json(proList);
  } catch (error) {
    // const logString = logger.error(
    //   `${req.userName} Failed to access update salary route, encountered following error => ${error}`
    // ).transports[0].logString;
    // await loggerService.createLogger('users', req.userId, logString);
    throw new Error(error);
  }
});

const generateUniqueReferenceNumbers = catchAsync(async (req, res) => {
  try {
    const response = await usersService.generateUniqueReferenceNumbers();
    const logString = logger.info(`${req.userName} Accessed Unique employee reference numbers route`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to the function to create unique referenc numbers for employees, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error(error);
  }
});

const mobileStats = catchAsync(async (req, res) => {
  try {
    const response = await usersService.mobileStats(req.query);
    const logString = logger.info(`${req.userName} Accessed mobile stats route`).transports[0]
      .logString;
    await loggerService.createLogger('users', req.userId, logString);
    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get stats for loged in users via mobile => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error(error);
  }
});

const exportDataForBulkUpload = catchAsync(async (req, res) => {
  try {
    const buffer = await usersService.exportDataForBulkUpload();

    if (!buffer) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to generate PEO Central Users Report!');
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=PEO Central Users Report.xlsx');
    res.send(buffer);
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Get statistics for tenancy and residence updates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTenancyAndResidenceStats = catchAsync(async (req, res) => {
  try {
    const stats = await usersService.getTenancyAndResidenceStats(req.query);
    res.status(httpStatus.OK).send(stats);
  } catch (error) {
    const logString = logger.error(`${req.userName || 'User'} Failed to get Tenancy and Residence stats, encountered following error => ${error?.message}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch statistics');
  }
});
module.exports = {
  userStatusDistribution,
  exportDataForBulkUpload,
  mobileStats,
  createUser,
  getAllUser,
  getUserById,
  getUserByEmail,
  updateUserOnId,
  deleteUserOnId,
  validateLogin,
  deleteUserOnId,
  userDetailsForEmpListingPage,
  userDetailsForEmpPageOnId,
  countsOfDifferentUsers,
  dynamicSearch,
  usersOnStatus,
  search,
  usersOnCompanyID,
  getUsersBetweenDatesAndStatus,
  allUsersNameCompanyImg,
  listAllUsersDropDown,
  usersOnCompanyIdListing,
  userListingSearchingFilteringAndPagination,
  listOfUsersStatus,
  validateCentralLogin,
  validateCentralValidation,
  countsOfDifferentUsersOnCompanyID,
  listOfAdminUsers,
  syncDocs,
  getLogin,
  ExcelData,
  ExcelReportVisa,
  AllProList,
  UserPaySlipPasswordCHecker,
  getUserDetailsForPaySlips,
  // getAllNonEmployees,
  // refreshToken
  updateMissingUserDetails,
  getAuthenticatedUserInfo,
  addAdditionalCostsToUserOnId,
  tenancyAndResidenceAddressUpdate,
  exportTenancyAndResidencyUpdates,
  geSystemProList,
  updateSalary,
  mobileLogin,
  generateUniqueReferenceNumbers,
  ClientLoginFlow,
  getAllSupportAgents,
  fetchEmployeesByCompanyIdAndEmployment,
  exportTenancyAndResidenceAddressUpdateData,
  getTenancyAndResidenceStats,
  updateInternalStaff,
  fetchInternalEmployees,
  createInternalStaff,
  updateUserProfile
};
