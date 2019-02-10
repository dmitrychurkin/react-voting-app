const { promisify } = require('util');
const Router = require('koa-router');
const passport = require('koa-passport');
const uuidv4 = require('uuid/v4');
const uuidv5 = require('uuid/v5');
const bcrypt = require('bcrypt-nodejs');
const { handle, app } = require('../next.app');
const { sequelize } = require('../models');
const { SALT_ROUNDS, MAILGUN_API_KEY, MAILGUN_DOMAIN } = require('../config');
const registrationConfirmationHelper = require('../emails/confirm-registration');
const mailgun = require('mailgun-js')({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

const genSaltPromised = promisify(bcrypt.genSalt);
const hashPromised = promisify(bcrypt.hash);


const koaRouter = new Router;

koaRouter.get('/api/auth', async ctx => {

  ctx.set('Cache-Control', 'no-cache');
  ctx.body = { auth: ctx.isAuthenticated() };

});

koaRouter.get('/account', async ctx => {
  if (ctx.isUnauthenticated()) {
    return ctx.redirect(`/login?r=${encodeURIComponent(ctx.href)}`);
  }

  if (ctx.isAuthenticated()) {
    const [ confirmedUser ] = await sequelize.query('SELECT * FROM `users` WHERE uuid = :uuid',
      { replacements: { uuid: ctx.state.user.uuid }, type: sequelize.QueryTypes.SELECT }
    );
    if (!confirmedUser.accountConfirmed) {
      return ctx.redirect('/confirm-email');
    }
  }

  await app.render(ctx.req, ctx.res, '/account', ctx.query);
  ctx.respond = false;
});

koaRouter.get('/sign-in', async ctx => {
  await app.render(ctx.req, ctx.res, '/sign-in', ctx.query);
  ctx.respond = false;
});

koaRouter.get('/login', async ctx => {
  await app.render(ctx.req, ctx.res, '/login', ctx.query);
  ctx.respond = false;
});

koaRouter.get('/confirm-email', async ctx => {

  if (ctx.isAuthenticated()) {
    const [ confirmedUser ] = await sequelize.query('SELECT * FROM `users` WHERE uuid = :uuid',
      { replacements: { uuid: ctx.state.user.uuid }, type: sequelize.QueryTypes.SELECT }
    );
    if (!confirmedUser.accountConfirmed) {
      ctx.res.customData.confirmEmailStatusCode = confirmedUser.accountConfirmationTokenExpiresAt >= Date.now() ? 1 : 2;
    }
  }else {

    const { accountConfirmationToken, accountConfirmationTokenExpiresAt } = ctx.session;
    console.log('session accountConfirmationToken, accountConfirmationTokenExpiresAt', accountConfirmationToken, accountConfirmationTokenExpiresAt);
    accountConfirmationToken ? 1 : -1;
    if (accountConfirmationToken) {
      ctx.res.customData.confirmEmailStatusCode = accountConfirmationTokenExpiresAt >= Date.now() ? 1 : 2;
      // code 1 - show message about check email
      // code 2 - token expires need to resend 
    }else {
      ctx.res.customData.confirmEmailStatusCode = -1; // no token exists - show 404
    }
  
  }

  await app.render(ctx.req, ctx.res, '/confirm-email', ctx.query);
  ctx.respond = false;

});

koaRouter.get('/confirm-email/:token', async ctx => {

  const [ confirmedUser ] = await sequelize.query('SELECT * FROM `users` WHERE accountConfirmationToken = :accountConfirmationToken',
    { replacements: { accountConfirmationToken: ctx.params.token }, type: sequelize.QueryTypes.SELECT }
  );

  console.log('confirmedUser => ', confirmedUser);

  if (confirmedUser) {

    if (ctx.isAuthenticated()) {
      return ctx.redirect('/account');
    }

    if (confirmedUser.accountConfirmationTokenExpiresAt >= Date.now()) {
      const login = await ctx.login(confirmedUser);
      console.log('login => ', login);
      const updateResult = await sequelize.query('UPDATE `users` SET accountConfirmed = :accountConfirmed, accountConfirmedAt = CURRENT_TIMESTAMP WHERE uuid = :uuid',
        { replacements: { accountConfirmed: true, uuid: confirmedUser.uuid }, type: sequelize.QueryTypes.UPDATE }
      );
      console.log('updateResult => ', updateResult);
      delete ctx.session.accountConfirmationToken;
      delete ctx.session.accountConfirmationTokenExpiresAt;
      ctx.res.customData.confirmEmailStatusCode = 3;
      // 3 - show confirmation success

    }else {
      ctx.res.customData.confirmEmailStatusCode = 2;
    }

  }else {
    ctx.res.customData.confirmEmailStatusCode = -1;
  }

  await app.render(ctx.req, ctx.res, '/confirm-email', ctx.query);
  ctx.respond = false;

});

koaRouter.get('*', async ctx => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
});

koaRouter.post('/login', async ctx => {
  return passport.authenticate('local', (err, user) => {
    if (err) {
      ctx.status = 500;
      return;
    }
    if (user === false) {
      ctx.status = 401;
      return;
    }
    
    if (!user.accountConfirmed) {
      ctx.body = { 
        //TODO: finish here 
      };
    }

      return ctx.login(user);
    
  })(ctx);
  
});

koaRouter.post('/sign-in', async ctx => {

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
    const accountConfirmationTokenExpiresAt = date.getTime();

    const hash = await hashPromised(password, salt, null);

    await Promise.all([
      sequelize.query(
        'INSERT INTO `users`(`firstName`, `lastName`, `email`, `password`, `uuid`, `accountConfirmationToken`, `accountConfirmationTokenExpiresAt`, `createdAt`, `updatedAt`) VALUES(:firstName, :lastName, :email, :hash, :uuid, :accountConfirmationToken, :accountConfirmationTokenExpiresAt, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        { 
          replacements: { 
            firstName, 
            lastName: lastName || '', 
            email, 
            hash, 
            uuid: uuidv4(),
            accountConfirmationToken,
            accountConfirmationTokenExpiresAt 
          }, 
          type: sequelize.QueryTypes.INSERT 
        }
      ),
      mailgun.messages().send(registrationConfirmationHelper({ to: email }, firstName, confirmationLink))
    ]);

    ctx.session.accountConfirmationToken = accountConfirmationToken;
    ctx.session.accountConfirmationTokenExpiresAt = accountConfirmationTokenExpiresAt;

    ctx.status = 200;


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

});

module.exports = koaRouter;