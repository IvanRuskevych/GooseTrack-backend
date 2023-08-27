const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? './production.env' : './.env',
});
const authRouter = require('./routes/api/auth');
const reviewRouter = require('./routes/api/reviews');
const tasksRouter = require('./routes/api/tasks');

const app = express();
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
