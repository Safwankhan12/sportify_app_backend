require('dotenv').config();
const { User, Token } = require('../models'); // Import the Token model
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
opts.passReqToCallback = true; // Enable req in callback

passport.use(
  new JwtStrategy(opts, async function (req, jwt_payload, done) {
    try {
      // Extract the token from the request header
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      
      const user = await User.findOne({ where: { id: jwt_payload.id } });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      // Check if the token exists in the Token model
      const validToken = await Token.findOne({ where: { token } });

      if (!validToken) {
        return done(null, false, { message: 'Token not found or user logged out' });
      }

      // Check if the token is expired
      if (validToken.expiresAt < new Date()) {
        await Token.destroy({ where: { token } }); // Remove expired token
        return done(null, false, { message: 'Token expired' });
      }

      // Token is valid, return the user
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);
