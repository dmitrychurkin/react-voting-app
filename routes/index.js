const Router = require('koa-router');
const { app, handle } = require('../next.app');

const koaRouter = new Router;
koaRouter.get('/a', async ctx => {
  await app.render(ctx.req, ctx.res, '/b', ctx.query);
  ctx.respond = false;
});

koaRouter.get('/b', async ctx => {
  await app.render(ctx.req, ctx.res, '/a', ctx.query);
  ctx.respond = false;
});

koaRouter.get('*', async ctx => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
});

module.exports = koaRouter;