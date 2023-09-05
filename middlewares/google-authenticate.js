const passport = require('passport');
const { Strategy } = require('passport-google-oauth2');
const bcrypt = require('bcrypt');
const uuid = require('uuid').v4;

const { User } = require('../models/user');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL } = process.env;

const googleParams = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/auth/google/callback`,
  passReqToCallback: true,
};

const googleCallback = async (req, accessToken, refreshToken, profile, done) => {
  try {
    const { email, displayName } = profile;
    const user = await User.findOne({ email });
    const verificationToken = uuid();

    if (user) {
      return done(null, user);
    }

    const hashedPassword = await bcrypt.hash(uuid(), 10);
    const newUser = await User.create(
      {
        email,
        password: hashedPassword,
        name: displayName,
        verificationToken,
      },
      { new: true }
    );
    return done(null, newUser);
  } catch (error) {
    done(error, false);
  }
};

const googleStrategy = new Strategy(googleParams, googleCallback);

passport.use('google', googleStrategy);

module.exports = passport;
