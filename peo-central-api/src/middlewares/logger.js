const winston = require('winston');
const moment = require('moment-timezone');

class StringTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.logString = '';
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    //------------Include Timestamp if necessary------------
    // const message = `${info.timestamp} ${info.level}: ${info.message}`;
    const message = `${info.level}: ${info.message}`;
    this.logString = message;
    callback();
  }
}

//------------Include Timestamp if necessary------------
// const logFormat = winston.format.printf(({ level, message, timestamp }) => {
//   return `${timestamp} ${level}: ${message}`;
// });
const logFormat = winston.format.printf(({ level, message }) => {
  return `${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format((info, opts) => {
      //------------Include Timestamp if necessary------------
      // if (info.timestamp) {
      //   info.timestamp = moment.tz(info.timestamp, 'UTC').tz('Asia/Dubai').format();
      // }
      return info;
    })(),
    //------------Include Timestamp if necessary------------
    // winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS', tz: 'Asia/Dubai' }),
    logFormat
  ),
  transports: [
    new StringTransport(),
    new winston.transports.Console(),
    //-----------Saving in the log files-----------
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;
