const { promisify } = require('util');
const Sequelize = require('sequelize');
const Router = require('koa-router');
const passport = require('koa-passport');
const uuidv4 = require('uuid/v4');
const uuidv5 = require('uuid/v5');
const bcrypt = require('bcrypt-nodejs');
const { handle } = require('../next.app');
const { sequelize } = require('../models');
const { SALT_ROUNDS, MAILGUN_API_KEY, MAILGUN_DOMAIN } = require('../config');
const registrationConfirmationHelper = require('../emails/confirm-registration');
const mailgun = require('mailgun-js')({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

const genSaltPromised = promisify(bcrypt.genSalt);
const hashPromised = promisify(bcrypt.hash);


const koaRouter = new Router;

koaRouter.get('*', async ctx => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
})
.post('/login', async ctx => {
  return passport.authenticate('local', (err, user) => {
    if (user === false) {
      ctx.body = { success: false };
      ctx.throw(401);
    } else {
      ctx.body = { success: true };
      return ctx.login(user);
    }
  })(ctx);
  
})
.post('/sign-in', async (ctx, next) => {

  ctx.checkBody('firstName', 'First name can\'t be empty').notEmpty();
  ctx.checkBody('firstName', 'First name must have atleast 3 characters long, please try again.').len(3, 100);
  ctx.checkBody('lastName', 'Last name must have atmost 100 characters long, please try again.').len(0, 100);
  ctx.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
  ctx.checkBody('email', 'Email must contain atmost 100 characters length.').len(3, 100);
  ctx.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);

  try {

    const errors = await ctx.validationErrors();

    if (errors) {

      ctx.body = errors;
      const validationError = new Error('Validation error occured');
      ctx.status = validationError.status = 400;
      throw validationError;

    }

    const salt = await genSaltPromised(SALT_ROUNDS || 10);

    const { email, firstName, lastName, password } = ctx.request.body;
    const accountConfirmationToken = uuidv5(ctx.origin, uuidv5.URL);
    const confirmationLink = `${ctx.origin}/confirm-email/${accountConfirmationToken}`;
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);

    const hash = await hashPromised(password, salt, null);
    const newUser = await sequelize.query(
      'INSERT INTO `users`(`firstName`, `lastName`, `email`, `password`, `uuid`, `accountConfirmationToken`, `accountConfirmationTokenExpiresAt`, `createdAt`, `updatedAt`) VALUES(:firstName, :lastName, :email, :hash, :uuid, :accountConfirmationToken, :accountConfirmationTokenExpiresAt, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      { 
        replacements: { 
          firstName, 
          lastName: lastName || '', 
          email, 
          hash, 
          uuid: uuidv4(),
          accountConfirmationToken,
          accountConfirmationTokenExpiresAt: date.getTime()
        }, 
        type: sequelize.QueryTypes.INSERT 
      }
    );

    const body = await mailgun.messages().send(registrationConfirmationHelper({ to: email }, firstName, confirmationLink));
    console.log('newUser, body => ', newUser, body);
    ctx.body = { newUser, body };
    

  }catch(err) {

    if (err.name === 'SequelizeUniqueConstraintError') {
      ctx.status = 400;
      // unify shape to validationErrors
      /**
       * Array<{
       *  msg: string;
       *  param?: string;
       *  value?: string;
       * }>
       */
      ctx.body = err.errors.reduce((prev, errObj) => [...prev, { msg: errObj.message }], []);
    }else if (typeof err.status !== 'number') {
      ctx.status = 500;
      ctx.body = err.message || '';
    }

  }

  await next();
  
});

module.exports = koaRouter;