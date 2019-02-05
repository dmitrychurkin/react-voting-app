const Router = require('koa-router');
const passport = require('koa-passport');
const bcrypt = require('bcrypt-nodejs');
const { app, handle } = require('../next.app');

const koaRouter = new Router;

koaRouter.get('*', async ctx => {
  console.log(ctx.path);
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
.post('/sign-in', async ctx => {
  await app.render(ctx.req, ctx.res, '/sign-in', ctx.query);
  ctx.respond = false;
});

module.exports = koaRouter;