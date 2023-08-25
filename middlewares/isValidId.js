const { isValidObjectId } = require('mongoose');

const { CustomError } = require('../utils');

const isValidId = (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    next(CustomError(400, `The next id: ${contactId}, is not valid`));
  }

  next();
};

module.exports = isValidId