const express = require('express');
const { httpLogger } = require('./middlewares');
const { logger, enableCORS } = require('./utils');
const path = require('path');

const filepath = `${path.dirname(__filename)}\ ${path.basename(__filename)}`;

const PORT = 8080;
const app = express();

app.use(httpLogger);
app.use(enableCORS);

app.get('/user', (req, res) => {
    res.send('Hello from user endpoint!');
  });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/home', (req, res) => {
  res.send('Hello from home endpoint!');
});



app.listen(PORT, () => {
  logger.info(`${filepath} Server listening on port ${PORT}`);
});