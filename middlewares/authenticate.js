const jwt = require('jsonwebtoken');

const { CustomError } = require('../utils');
const { User } = require('../models/user');

const { ACCESS_SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');
  console.log('bearer', bearer);
  console.log('token', token);

  if (bearer !== 'Bearer') {
    next(CustomError(401, 'Not authorized'));
  }

  try {
    const { id } = jwt.verify(token, ACCESS_SECRET_KEY);

    const user = await User.findById(id);

    console.log('USER-authenticate ', user);
    const { accessToken } = user;

    if (!user || !accessToken || accessToken !== token) {
      next(CustomError(401, 'Not authorized'));
    }

    req.user = user;

    next();
  } catch (error) {
    next(CustomError(401, 'Not authorized'));
  }
};

module.exports = authenticate;
