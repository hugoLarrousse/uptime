const winston = require('winston');
const WinstonSlack = require('winston-slack-hook');

const { slackUrl, channelSlack }= process.env;

const customLogger = winston.createLogger({
  transports: [
    new WinstonSlack({
      hookUrl: slackUrl,
      username: 'Thierry Roland',
      channel: `#${channelSlack}`,
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
  const label = createLabelStatusCode(url, statusCode);
  console.error(label);
  return customLogger.error(label);
};

exports.warn = (url, elapsedTime, max) => {
  const label = createLabelElapsedTime(url, elapsedTime, max)
  console.warn(label);
  return customLogger.warn(label);
};