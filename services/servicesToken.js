const jwt = require('jsonwebtoken');
const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } =
  process.env;

exports.createTokens = (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_TIME });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_TIME,
  });
  return { accessToken, refreshToken };
};
