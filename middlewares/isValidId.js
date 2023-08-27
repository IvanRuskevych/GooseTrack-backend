const { isValidObjectId } = require('mongoose');

const { CustomError } = require('../utils');

const isValidId = (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    next(CustomError(400, `The next id: ${id}, is not valid`));
  }

  next();
};

module.exports = isValidId;
