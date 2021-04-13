const request = require('requestretry');
const cron = require('node-cron');
const moment = require('moment');
require('dotenv').config();

// const express = require('express')();

// const server = require('http').createServer(express);

const logger = require('./loggerSlack');
const mongo = require('./mongo');

const { testUrl } = process.env;

const options = {
  url: testUrl,
  json: true,
  time: true,
  maxAttempts: 3,
  retryDelay: 5000,
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError
};

const MAX_ELAPSE_TIME = 300;
const MAX_NORMAL_STATUS_CODE = 59;
const MINUTE_STORE = 0;

let timer = [];
let normalStatusCode = 0;


// express.all('/', (req, res) => {
//   res.status(200).send({ message: 'Welcome to uptime' });
// });

// server.listen(3002, () => {
//   console.log(`Uptime-core is running at ${new Date()} on 3002`);
// });

const isBusy = false;


const main = async () => {
  cron.schedule('* * * * *', async () => {
    try {
      if (busy) throw Error('busy');
      busy = true;
      const { statusCode, elapsedTime } = await request(options);

      if (statusCode !== 200) {
        await logger.error(testUrl, statusCode);
        await mongo.incrementStatusCode(statusCode);
      } else {
        normalStatusCode +=1;
      }
      if (statusCode === 200 && elapsedTime > MAX_ELAPSE_TIME) {
        await logger.warn(testUrl, elapsedTime, MAX_ELAPSE_TIME);
      }

      timer.push(elapsedTime);
      if (moment().minutes() === MINUTE_STORE) {
        const avgTime = timer.reduce((a,b) => a + b, 0) / timer.length;
        await mongo.pushElapseTime(avgTime);
        timer = [];
      }
      if (normalStatusCode === MAX_NORMAL_STATUS_CODE) {
        await mongo.incrementStatusCode(200, 59);
        normalStatusCode = 0;
      }
      busy = false;
      // console.log('timer :', timer);
      // console.log('normalStatusCode :', normalStatusCode);
    } catch (e) {
      console.log('e.message :', e.message);
    }
  });
}

mongo.createConnection().then((code) => {
  if (code) {
    main()
  } else {
    console.log('Error with MongoDb connection');
  }
});

