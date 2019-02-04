const passport = require('koa-passport');
const bcrypt = require('bcrypt-nodejs');
const { sequelize } = require('../models');
const crypto = require('crypto');

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
    const user = await sequelize.query(
      'SELECT * FROM users WHERE uuid = :uuid',
      { replacements: { uuid }, type: sequelize.QueryTypes.SELECT }
    );
    done(null, user)
  } catch (err) {
    done(err);
  }
});

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  const user = await sequelize.query(
    'SELECT * FROM users WHERE email = :email',
    { replacements: { email }, type: sequelize.QueryTypes.SELECT }
  );
  if (user) {
    bcrypt.compare(password, user.password, (error, response) => {
      if (response) {
        done(null, user)
      } else { 
        done(null, false)
      }
    })
  } else {
    done(null, false)
  }
}));

const RememberMeStrategy = require('passport-remember-me').Strategy;

passport.use(new RememberMeStrategy(
  async function(token, done) {
    try {
      const user = await sequelize.query(
        'SELECT * FROM users WHERE remember_token = :token',
        { replacements: { token }, type: sequelize.QueryTypes.SELECT }
      );
      if (user) {
        return done(null, user);
      }
      return done(null, false);

    }catch(err) {

      return done(err);

    }
    
  },
  function(user, done) {
    
    crypto.randomBytes(64, async (err, buf) => {
      if (err) {
        return done(err);
      }

      try {
        await sequelize.query(
          `UPDATE users 
          SET 
            remember_token = :token 
          WHERE 
            uuid = :uuid`,
          { 
            replacements: { 
              token: buf.toString('hex'), 
              uuid: user.uuid
            }, 
            type: sequelize.QueryTypes.SELECT 
          }
        );
        return done(null, token);
      }catch(err) {
        return done(err);
      }

    });
  }
));
