const { app: nextApp } = require('./next.app');

nextApp.prepare()
  .then(() => {
    const Koa = require('koa');
    const server = new Koa;
    server.keys = ['never will guess'];
    require('koa-qs')(server);

    const logger = require('koa-logger');
    const compression = require('compression');
    const koaConnect = require('koa-connect');
    const session = require('koa-session');
    const bodyParser = require('koa-bodyparser');
    const koaValidator = require('koa-async-validator');
    const passport = require('koa-passport');
    const router = require('./routes');
    const db = require('./models');
    // authentication
    require('./util/auth');

    server
          .use(logger())
          .use(koaConnect(compression))
          .use(session({}, server))
          .use(bodyParser())
          .use(koaValidator())
          .use(passport.initialize())
          .use(passport.session())
          .use(passport.authenticate('remember-me'))
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
    })
  })
  .catch(e => {
    console.error(e.stack);
    process.exit(1);
  });