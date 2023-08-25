const { CustomError } = require('../utils');

exports.validateBody = (schema) => {
  const fn = (req, _, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      next(CustomError(400, error.message));
    }

    next();
  };

  return fn;
};
