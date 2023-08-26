const isValidId = require('./isValidId');

const validateBody = require('./validateBody');
const handleMongooseError = require('./handleMongooseError');

const uplod = require('./upload');

const authenticate = require('./authenticate');

module.exports = {
  isValidId,
  validateBody,

  authenticate

  uplod,
  handleMongooseError,

};
