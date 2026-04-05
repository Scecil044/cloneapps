const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 50,
  handler: (req, res,next)=> {
    return res.status(429).json({
      success: false,
      message: 'Too many failed requests, please try again in 2 minutes.',
    })
  },
  skipSuccessfulRequests: true,
});

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  handler: (req, res,next)=>{
    return res.status(429).json({
      success: false,
      message: 'Too many upload requests, please try again in 10 minutes.',
    })
  }
});

const commonLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res,next)=> {
    return res.status(426).json({
      success: false,
      message: 'Too many requests, please try again in 15 minutes'
    })
  }
});

module.exports = {
  authLimiter,
  uploadLimiter,
  commonLimiter,
};
