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

    if (user) {
      return done(null, user); // передає данні далі, а також робить "під капотом" req.user=user
    }

    const hashedPassword = await bcrypt.hash(uuid(), 10); // user ніколи не використовує, але він є згідно з нашою схемою реєстрації
    const newUser = await User.create({ email, password: hashedPassword, name: displayName });
    return done(null, newUser);
  } catch (error) {
    done(error, false); // перекидає на обробник помилок
  }
};

const googleStrategy = new Strategy(googleParams, googleCallback);
