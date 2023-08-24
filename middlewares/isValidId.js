const { isValidObjectId } = require('mongoose');

const { HttpError } = require('../utils');

exports.isValidId = (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    next(HttpError(400, `The next id: ${contactId}, is not valid`));
  }

  next();
};
