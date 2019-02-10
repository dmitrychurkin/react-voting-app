const { FROM_EMAIL_ADDRESS } = require('../config');
const htmlBodyHelper = (name, url) => {
  console.log('htmlBodyHelper name, url => ', name, url);
  return `
      Dear ${name.toString().charAt(0).toUpperCase() + name.toString().slice(1)}, please follow <a href="${url}">this link</a> to finish registration.
      Your sincerely, Dmitry Churkin`;
};

module.exports = function ({ from= FROM_EMAIL_ADDRESS, to, subject= 'Account registration confirmation', htmlBodyFn= htmlBodyHelper }, ...args) {
  return {
    from, to, subject, html: typeof htmlBodyFn === 'function' ? htmlBodyFn(...args) : htmlBodyFn.toString()
  };
};