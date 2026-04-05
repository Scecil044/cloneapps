const winston = require('winston');

class StringTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.logString = '';
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    const message = `${info.level}: ${info.message}`;
    this.logString = message;
    callback();
  }
}

const logFormat = winston.format.printf(({ level, message }) => {
  return `${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format((info, opts) => {
      return info;
    })(),
    logFormat
  ),
  transports: [
    new StringTransport(),
    new winston.transports.Console()
  ]
});

module.exports = logger;
