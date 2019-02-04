const Router = require('koa-router');
const passport = require('koa-passport');
const bcrypt = require('bcrypt-nodejs');
const { app, handle } = require('../next.app');

const koaRouter = new Router;
koaRouter.get('/home', async ctx => {
  await app.render(ctx.req, ctx.res, '/home', ctx.query);
  ctx.respond = false;
});

koaRouter.get('/login', async ctx => {
  await app.render(ctx.req, ctx.res, '/login', ctx.query);
  ctx.respond = false;
})
.post('/login', async (ctx, next) => {
  return passport.authenticate('local', (err, user) => {
    if (user === false) {
      ctx.body = { success: false };
      ctx.throw(401);
    } else {
      ctx.body = { success: true };
      return ctx.login(user);
    }
  })(ctx);
  await next();
});

koaRouter.get('/sign-in', async ctx => {
  await app.render(ctx.req, ctx.res, '/sign-in', ctx.query);
  ctx.respond = false;
})
.post('/sign-in', async ctx => {
  await app.render(ctx.req, ctx.res, '/sign-in', ctx.query);
  ctx.respond = false;
});

koaRouter.get('*', async ctx => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
});

module.exports = koaRouter;