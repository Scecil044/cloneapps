const httpStatus = require('http-status');
const { enrollmentsService } = require('../services');

const listAllEnrollments = async (req, res) => {
  try {
    const enrollments = await enrollmentsService.listAllEnrollments();
    res.status(httpStatus.OK).send(enrollments);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }

}
const createEnrollment = async (req, res) => {
  try {
    const enrollment = await enrollmentsService.createEnrollment(req.body);
    res.status(httpStatus.CREATED).send(enrollment);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}
const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await enrollmentsService.getEnrollmentById(req.params.enrollmentId);
    res.status(httpStatus.OK).send(enrollment);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}
const updateEnrollmentById = async (req, res) => {
  try {
    const enrollment = await enrollmentsService.updateEnrollmentById(req.params.enrollmentId, req.body);
    res.status(httpStatus.OK).send(enrollment);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}
const deleteEnrollmentById = async (req, res) => {
  try {
    await enrollmentsService.deleteEnrollmentById(req.params.enrollmentId);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}

const sendInitialEmail = async (req, res) => {
  try {
    await enrollmentsService.sendInitialEmail(req.params.enrollmentId);
    res.status(httpStatus.OK).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}

const sendConfirmationEmail = async (req, res) => {
  try {
    await enrollmentsService.sendConfirmationEmail(req.params.enrollmentId);
    res.status(httpStatus.OK).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}



const verifyEnrollment = async (req, res) => {
  try {
    await enrollmentsService.verifyEnrollment(req.params.enrollmentId, req.body);
    res.status(httpStatus.OK).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}

const getEntrollmentByCompanyEmail = async (req, res) => {
  try {
    const enrollment = await enrollmentsService.getEntrollmentByCompanyEmail(req.query.companyEmail);
    res.status(httpStatus.OK).send(enrollment);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}

const getEnrollmentByCompanyId = async (req, res) => {
  try {
    const enrollment = await enrollmentsService.getEnrollmentByCompanyId(req.params.companyId);
    res.status(httpStatus.OK).json(enrollment);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}
const uploadFiles = async (req, res) => {
  try {
    const urls = await enrollmentsService.simpleDocumentUpload(req.params.enrollmentId, req.files,);
    res.status(httpStatus.OK).send(urls);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}

module.exports = {
  listAllEnrollments,
  createEnrollment,
  getEnrollmentById,
  updateEnrollmentById,
  deleteEnrollmentById,
  sendInitialEmail,
  verifyEnrollment,
  sendConfirmationEmail,
  uploadFiles,
  getEntrollmentByCompanyEmail,
  getEnrollmentByCompanyId
};
