const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const timeout = require('connect-timeout');
const httpStatus = require('http-status');
const fileUpload = require('express-fileupload');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');


const { authLimiter } = require('./middlewares/rateLimiter')
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();


if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());
// enable cors
app.use(cors());
app.options('*', cors());
// const corsOptions = {
//   origin: true, // Allow all origins
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: [
//     'Origin', 
//     'X-Requested-With', 
//     'Content-Type', 
//     'Accept', 
//     'Authorization', 
//     'X-API-Key'  // <-- Added this for your API
//   ],
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
app.use(timeout('180s'));
// for uploading files. This enables to see req.files
app.use(fileUpload({ useTempFiles: true, limits: { fileSize: 50 * 1024 * 1024 } }));

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// sanitize request data - DISABLED FOR NOW. BUT WE MUST APPLY XSS TO PREVENT ATTACKS
// app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
  res.header('X-Frame-Options', 'DENY'); // if its required to change, update it to SAMEORIGIN and retest
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.header('X-DNS-Prefetch-Control', 'Off');
  res.header('X-Download-Options', 'noopen');
  res.header(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'",
  );
  return next();
});

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

require('./utils/console-log-interceptor')('freelancer');
// limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/v1/auth', authLimiter);
// }

// v1 api routes
app.get('/', (req, res) => {
  res.send("Hello from PEO Central");
});
app.use(routes);


const RedisGetRouter = require('../src/redis/getData');
app.use('/get', RedisGetRouter);

const RedisSetRouter = require('../src/redis/setData');
app.use('/set', RedisSetRouter);

const requestsRouter = require('./routes/v1/requests');
app.use('/requests', requestsRouter);

const WfhsRouter = require('./routes/v1/wfh');
app.use('/wfh', WfhsRouter);
const wfhConfigRouter = require('./routes/v1/wfhConfig');
app.use('/wfhconfig', wfhConfigRouter);

const leavesRouting = require('./routes/v1/leaves');
app.use('/leaves', leavesRouting);
const leaveConfig = require('./routes/v1/leavesConfig');
app.use('/leaveconfig', leaveConfig);

const claimRouter = require('./routes/v1/claim');
app.use('/claim', claimRouter);
const claimConfig = require('./routes/v1/claimConfig');
app.use('/claimconfig', claimConfig);

// const shiftsRouting = require('./routes/v1/shifts');
// app.use('/shifts', shiftsRouting);
// const shiftConfig = require('./routes/v1/shiftConfig');
// app.use('/shiftconfig', shiftConfig);

const salaryAdjustmentRouter = require('./routes/v1/salaryAdjustment');
app.use('/salaryAdjustment', salaryAdjustmentRouter);

const socialsRouting = require('./routes/v1/socials');
app.use('/socials', socialsRouting);

const reportsRouter = require('./routes/v1/reports');
app.use('/reports', reportsRouter);

const reportsRouting = require('./routes/v1/reportbuilder');
app.use('/reportbuilder', reportsRouting);

const biReportRouting = require('./routes/v1/bi_report');
app.use('/bi_report', biReportRouting);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
