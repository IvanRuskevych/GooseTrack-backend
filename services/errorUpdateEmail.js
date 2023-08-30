const { User } = require('../models/user');
const { CustomError } = require('../utils');

const errorUpdateEmail = async (emailFromBody, idFromReq) => {
  const userExists = await User.exists({ email: emailFromBody, _id: { $ne: idFromReq } });

  if (userExists) throw CustomError(409, 'User with this email exists..');
};

module.exports = errorUpdateEmail;
