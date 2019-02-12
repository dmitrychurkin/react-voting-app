const { app: nextApp } = require('./next.app');
const { SESSION_SECRET, SESSION_KEYS } = require('./config');

nextApp.prepare()
  .then(() => {
    const Koa = require('koa');
    const server = new Koa;
    server.keys = SESSION_KEYS;
    require('koa-qs')(server);

    const logger = require('koa-logger');
    const compression = require('compression');
    const koaConnect = require('koa-connect');
    const session = require('koa-session');
    const bodyParser = require('koa-bodyparser');
    const xhr = require('koa-request-xhr');
    const koaValidator = require('koa-async-validator');
    const passport = require('koa-passport');
    const CSRF = require('koa-csrf');
    const router = require('./routes');
    const db = require('./models');

    // authentication
    require('./util/auth');

    server
          .use(logger())
          .use(koaConnect(compression))
          .use(session({}, server))
          .use(bodyParser())
          .use(xhr())
          .use(async (ctx, next) => {

            if (!ctx.session.secret) {
              ctx.session.secret = SESSION_SECRET;
            }

            if (ctx.method === 'POST') {
              console.log('LOGGGING TOKEN CSRF ', ctx.request.body._csrf);
            }
            await next();
          })
          .use(new CSRF)
          .use(koaValidator())
          .use(passport.initialize())
          .use(passport.session())
          .use(passport.authenticate('remember-me'))
          .use(async (ctx, next) => {
            ctx.res.statusCode = 200;
            if (ctx.method === 'GET') {

              if (typeof ctx.res.customData !== 'object') {
                ctx.res.customData = {};
              }
            
              ctx.res.customData.csrf = ctx.csrf;

            }
            await next();
          })
          .use(router.routes())
          .use(router.allowedMethods());

    const PORT = parseInt(process.env.PORT, 10) || 3000;
    db.sequelize.sync().then(() => {
      server.listen(PORT, err => {
        if (err) {
          throw err;
        }
        console.log(`> Ready on http://localhost:${PORT}`);
      });
    });

    server.on('error', (err, ctx) => {
      if (!err.name.includes('ERR_HTTP_HEADERS_SENT')) {
        console.error(err);
      }
    });

  })
  .catch(e => {
    console.error(e.stack);
    process.exit(1);
  });