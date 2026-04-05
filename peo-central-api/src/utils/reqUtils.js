const jwtDecode = require('jwt-decode');

const logRequestBody = (req) => {
  return JSON.stringify(Object.keys(req.body), null, 2);
};

const getUserId = (req) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if(token === undefined)
      return "No Token Found";
    const decoded = jwtDecode(token);
    const userId = decoded._id;
    return userId;
  } catch (error) {
    return "No Token Found";
  }
};

module.exports = { logRequestBody, getUserId };
