const winston = require('winston');
const WinstonSlack = require('winston-slack-hook');

const { slackUrl, channel }= process.env;

const customLogger = winston.createLogger({
  transports: [
    new WinstonSlack({
      hookUrl: slackUrl,
      username: 'Thierry Roland',
      channel: `#${channel}`,
      prependLevel: false,
      appendMeta: false,
      colors: {
        warn: 'warning',
        error: 'danger',
        info: 'good',
        debug: '#bbddff',
      },
    }),
  ],
});

const createLabelStatusCode = (url, statusCode) => {
  return `*ERROR*
${url}
statusCode: *${statusCode}*`;
};

const createLabelElapsedTime = (url, elapsedTime, max) => {
  return `${url}
response time too long (> ${max}ms),
elapsedTime: *${elapsedTime}ms*`;
};


exports.error = (url, statusCode) => {
  return customLogger.error(createLabelStatusCode(url, statusCode));
};

exports.warn = (url, elapsedTime, max) => {
  return customLogger.warn(createLabelElapsedTime(url, elapsedTime, max));
};