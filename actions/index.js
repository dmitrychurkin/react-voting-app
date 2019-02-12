import { createAction, createActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';

const login = createFormAction('LOGIN');

const signIn = createFormAction('SIGN-IN');

const emailConfiramtionState = createAction('EMAIL_CONFIRMATION_STATE');

const setCsrf = createAction('SET_CSRF');

const logout = createActions({
  'LOGOUT': {
    'REQUEST': undefined,
    'SUCCESS': undefined,
    'FAILURE': undefined
  }
});
logout.REQUEST = 'LOGOUT/REQUEST';

const resendEmailConfirmationToken = createActions({
  'RESEND_EMAIL_CONFIRMATION_TOKEN': {
    'REQUEST': undefined,
    'FAILURE': undefined
  }
});
resendEmailConfirmationToken.REQUEST = 'RESEND_EMAIL_CONFIRMATION_TOKEN/REQUEST';

export { login, signIn, emailConfiramtionState, setCsrf, logout, resendEmailConfirmationToken };
