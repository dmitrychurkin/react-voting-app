const { FROM_EMAIL_ADDRESS } = require('../config');
const htmlBodyHelper = (name, url) => `
Dear ${name.toString().charAt(0).toUpperCase() + name.toString().slice(1)}, please follow <a href="${url}">this link</a> to finish registration.
Your sincerely, Dmitry Churkin`;

module.exports = function ({ from= FROM_EMAIL_ADDRESS, to, subject= 'Account registration confirmation', htmlBodyFn= htmlBodyHelper }, args) {
  return {
    from, to, subject, html: typeof htmlFnOrText === 'function' ? htmlBodyFn(...args) : htmlBodyFn.toString()
  };
};