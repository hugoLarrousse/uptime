const express = require('express')();

const server = require('http').createServer(express);


express.all('/', (req, res) => {
  res.status(200).send({ message: 'Welcome to uptime' });
});

server.listen(3002, () => {
  console.log(`Uptime-core is running at ${new Date()} on 3002`);
});