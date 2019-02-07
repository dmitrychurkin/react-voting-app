const { promisify } = require('util');
const Router = require('koa-router');
const passport = require('koa-passport');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt-nodejs');
const { handle } = require('../next.app');
const { sequelize } = require('../models');

const genSaltPromised = promisify(bcrypt.genSalt);
const hashPromised = promisify(bcrypt.hash);

const defaultSaltRounds = 10;

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
      return ctx.throw(400, new Error('Validation error'));

    }

    const salt = await genSaltPromised(defaultSaltRounds);

    const { email, firstName, lastName, password } = ctx.request.body;

    const hash = await hashPromised(password, salt, null);
    const newUser = await sequelize.query(
      'INSERT INTO `users`(`firstName`, `lastName`, `email`, `password`, `uuid`, `createdAt`, `updatedAt`) VALUES(:firstName, :lastName, :email, :hash, :uuid, :createdAt, :updatedAt)',
      { replacements: { firstName, lastName: lastName || '', email, hash, uuid: uuidv4(), createdAt: Date.now(), updatedAt: Date.now() }, type: sequelize.QueryTypes.INSERT }
    );
    console.log('newUser => ', newUser);
    ctx.body = { newUser };

    await next();

  }catch(err) {

    ctx.body = err.message;
    console.log(err);
    return ctx.throw(500, err.message);

  }
  
});

module.exports = koaRouter;