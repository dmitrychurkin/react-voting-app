const { promisify } = require('util');
const passport = require('koa-passport');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const { sequelize } = require('../models');
const { REMEMBER_ME_TOKEN_LENGTH } = require('../config');

const bcryptComparePromised = promisify(bcrypt.compare);
const randomBytesPromised = promisify(crypto.randomBytes);

/**
 * Serialize user
 * 
 * @param object        User info
 */
passport.serializeUser((user, done) => {
  done(null, user.uuid);
});

/**
 * Deserialize user from session
 * 
 * @param integer        User id
 * @returns
 */
passport.deserializeUser(async (uuid, done) => {
  try {

    const [ user ] = await sequelize.query(
      'SELECT * FROM `users` WHERE uuid = :uuid',
      { replacements: { uuid }, type: sequelize.QueryTypes.SELECT }
    );
    
  } catch (err) {

    done(err);
    return;

  }

  done(null, user);

});

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {

  try {

    const [ user ] = await sequelize.query(
      'SELECT * FROM `users` WHERE email = :email',
      { replacements: { email }, type: sequelize.QueryTypes.SELECT }
    );

    if (user) {

      const passwordsMatch = await bcryptComparePromised(password, user.password);

      if (passwordsMatch) {
        done(null, user);
        return;
      }

    }
 
  }catch(err) { console.error(err); }

  done(null, false);
  
}));

const RememberMeStrategy = require('passport-remember-me').Strategy;

passport.use(new RememberMeStrategy(
  async (token, done) => {

    try {

      const [ user ] = await sequelize.query(
        'SELECT * FROM `users` WHERE remember_token = :token',
        { replacements: { token }, type: sequelize.QueryTypes.SELECT }
      );

      if (user) {

        done(null, user);
        return;

      }
      

    }catch(err) {

      done(err);
      return;

    }

    done(null, false);

  },
  async (user, done) => {
    
    try {

      const buffer = await randomBytesPromised(REMEMBER_ME_TOKEN_LENGTH);
      const rememberToken = buffer.toString('hex');

      await sequelize.query(
        'UPDATE `users` SET remember_token = :rememberToken WHERE uuid = :uuid',
        { 
          replacements: { 
            rememberToken, 
            uuid: user.uuid
          }, 
          type: sequelize.QueryTypes.SELECT 
        }
      );

    }catch(err) {

      done(err);
      return;

    }

    done(null, token);

  }
));
