import { createAction, createActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';

export const login = createFormAction('LOGIN');

export const signIn = createFormAction('SIGN-IN');

export const emailConfiramtionState = createAction('EMAIL_CONFIRMATION_STATE');

export const setCsrf = createAction('SET_CSRF');

export const logout = createActions({
  'LOGOUT': {
    'REQUEST': undefined,
    'SUCCESS': undefined,
    'FAILURE': undefined
  }
});
logout.REQUEST = 'LOGOUT/REQUEST';

export const resendEmailConfirmationToken = createActions({
  'RESEND_EMAIL_CONFIRMATION_TOKEN': {
    'REQUEST': undefined,
    'FAILURE': undefined
  }
});
resendEmailConfirmationToken.REQUEST = 'RESEND_EMAIL_CONFIRMATION_TOKEN/REQUEST';
console.log(resendEmailConfirmationToken.resendEmailConfirmationToken.request);

