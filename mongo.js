const { MongoClient } = require('mongodb');
const moment = require('moment');

const { dbServer, database, collection } = process.env;
let mongodbConnect = null;

exports.createConnection = async () => {
  try {
    mongodbConnect = await MongoClient
      .connect(dbServer, { poolSize: 1, useNewUrlParser: true, useUnifiedTopology: true });
    return 1;
  } catch (e) {
    console.error(__filename, 'createConnection', e.message);
    return 0;
  }
};

const findAndModify = async (databaseName, collectionName, query, toUpdate, options) => {
  const docFoundAndModified = await mongodbConnect
    .db(databaseName)
    .collection(collectionName)
    .findOneAndUpdate(query, toUpdate, options);
  if (docFoundAndModified.ok === 1) {
    return docFoundAndModified.value;
  }
  console.log(__filename, findAndModify.name, `error: query: ${query}, toUpdate: ${toUpdate}; options: ${options}`);
  return null;
};


exports.pushElapseTime = (time) => findAndModify(database, collection,
  { _id: `uptime-elapse-time-${moment().format('DD-MM-YYYY')}` },
  { $push: { timer: time } },
  { returnOriginal: false, upsert: true });

exports.incrementStatusCode = (statusCode, value) => findAndModify(database, collection,
  { _id: `uptime-status-code-${moment().format('DD-MM-YYYY')}` },
  { $inc: { [statusCode]: value || 1 } },
  { returnOriginal: false, upsert: true });
