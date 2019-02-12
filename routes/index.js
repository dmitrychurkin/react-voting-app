const { promisify } = require('util');
const Router = require('koa-router');
const passport = require('koa-passport');
const uuidv4 = require('uuid/v4');
const uuidv5 = require('uuid/v5');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const { handle, app } = require('../next.app');
const { sequelize } = require('../models');
const { SALT_ROUNDS, MAILGUN_API_KEY, MAILGUN_DOMAIN, REMEMBER_ME_TOKEN_LENGTH, REMEMBER_ME_COOKIE } = require('../config');
const registrationConfirmationHelper = require('../emails/confirm-registration');
const mailgun = require('mailgun-js')({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

const genSaltPromised = promisify(bcrypt.genSalt);
const hashPromised = promisify(bcrypt.hash);
const randomBytesPromised = promisify(crypto.randomBytes);


const koaRouter = new Router;

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
  if (ctx.isAuthenticated()) {
    return ctx.redirect('back');
  }
  await app.render(ctx.req, ctx.res, '/login', ctx.query);
  ctx.respond = false;
});

koaRouter.head('/logout', ctx => {

  if (!ctx.state.xhr) {
    ctx.status = 400;
    return;
  }

  ctx.logout();
  ctx.status = 200;
  return;

});

koaRouter.head('/resend-email-confirmation/:current_token', async ctx => {
  
  if (!ctx.state.xhr) {
    ctx.status = 400;
    return;
  }

  let user, currentAccountConfirmationToken = ctx.params.current_token;

  if (ctx.isAuthenticated()) {
    currentAccountConfirmationToken = ctx.state.user.accountConfirmationToken;
    user = ctx.state.user;
  }

  if (!currentAccountConfirmationToken) {
    ctx.status = 400;
    return;
  }

  if (ctx.isUnauthenticated()) {
    [ user ] = await sequelize.query('SELECT * FROM `users` WHERE accountConfirmationToken = :accountConfirmationToken',
                                      { replacements: { accountConfirmationToken: currentAccountConfirmationToken }, type: sequelize.QueryTypes.SELECT }
                                    );
  }

  const newAccountConfirmationToken = uuidv5(ctx.origin, uuidv5.URL);
  const confirmationLink = `${ctx.origin}/confirm-email/${newAccountConfirmationToken}`;
  const date = new Date();
  date.setMinutes(date.getMinutes() + 30);
  const accountConfirmationTokenExpiresAt = date.getTime();

  await Promise.all([
    await sequelize.query(
      'UPDATE `users` SET accountConfirmationToken = :newAccountConfirmationToken, accountConfirmationTokenExpiresAt = :accountConfirmationTokenExpiresAt WHERE uuid = :uuid',
      { 
        replacements: { 
          newAccountConfirmationToken, 
          accountConfirmationTokenExpiresAt,
          uuid: user.uuid
        }, 
        type: sequelize.QueryTypes.UPDATE 
      }
    ),
    mailgun.messages().send(registrationConfirmationHelper({ to: user.email }, user.firstName, confirmationLink))
  ]);

  ctx.session.accountConfirmationToken = newAccountConfirmationToken;
  ctx.session.accountConfirmationTokenExpiresAt = accountConfirmationTokenExpiresAt;

  ctx.status = 200;
  
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
    
    ctx.res.customData.confirmEmailStatusCode = accountConfirmationToken ? 1 : -1;
      // code 1 - show message about check email
      // code 2 - token expires need to resend 

      // no token exists - show 404

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

    if (confirmedUser.accountConfirmed && ctx.isAuthenticated()) {
      return ctx.redirect('/account');
    }

    if (confirmedUser.accountConfirmationTokenExpiresAt >= Date.now()) {

      const updateResult = await sequelize.query('UPDATE `users` SET accountConfirmed = :accountConfirmed, accountConfirmedAt = CURRENT_TIMESTAMP WHERE uuid = :uuid',
        { replacements: { accountConfirmed: true, uuid: confirmedUser.uuid }, type: sequelize.QueryTypes.UPDATE }
      );
      console.log('updateResult => ', updateResult);
      delete ctx.session.accountConfirmationToken;
      delete ctx.session.accountConfirmationTokenExpiresAt;
      ctx.res.customData.confirmEmailStatusCode = 3;
      // 3 - show confirmation success

      return passport.authenticate('local', async (err, user) => {

        const login = await ctx.login(user);
        console.log('login => ', login, ' user => ', user);

        ctx.res.customData.userLogged = true;

        await app.render(ctx.req, ctx.res, '/confirm-email', ctx.query);
        ctx.respond = false;

      })(ctx);


    }else {

      ctx.res.customData.confirmEmailStatusCode = 2;

    }

  }else {

    ctx.res.customData.confirmEmailStatusCode = -1;

  }

  if (!ctx.headerSent) {
    await app.render(ctx.req, ctx.res, '/confirm-email', ctx.query);
    ctx.respond = false;
  }
  
});

koaRouter.get('*', async ctx => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
});

koaRouter.post('/login', async ctx => {
  console.log('Request body => ', ctx.request.body);
  if (!ctx.state.xhr) {
    ctx.status = 400;
    return;
  }
  return passport.authenticate('local', async (err, user) => {
    if (err) {
      ctx.status = 500;
      return;
    }
    if (user === false) {
      ctx.status = 401;
      return;
    }

    try {

      const loginResult = await ctx.login(user);
      console.log('loginResult => ', loginResult);

      let response = { userLogged: true, emailConfirmationState: 3 };

      if (!user.accountConfirmed) {
        const emailConfirmationState = user.accountConfirmationTokenExpiresAt >= Date.now() ? 1 : 2;
        response = Object.assign({}, response, { emailConfirmationState });
      }

      const remember_me = ctx.request.body.remember_me;

      if (remember_me) {

        const buffer = await randomBytesPromised(REMEMBER_ME_TOKEN_LENGTH);

        const rememberToken = buffer.toString('hex');

        await sequelize.query(
          'UPDATE `users` SET remember_token = :rememberToken WHERE uuid = :uuid',
          { 
            replacements: { 
              rememberToken, 
              uuid: user.uuid
            }, 
            type: sequelize.QueryTypes.UPDATE 
          }
        );

        ctx.cookies.set(REMEMBER_ME_COOKIE, rememberToken, {
          maxAge: 604800000
        });

      }

      ctx.body = { ...response };

    }catch(err) {

      ctx.status = 500;

    }

  })(ctx);
});

koaRouter.post('/sign-in', async ctx => {

  if (!ctx.state.xhr) {
    ctx.status = 400;
    return;
  }

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
    console.log('Error occured while signin ', err);
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