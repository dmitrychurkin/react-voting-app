import { createAction } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';

export const login = createFormAction('LOGIN');

export const signIn = createFormAction('SIGN-IN');

export const emailConfiramtionState = createAction('EMAIL_CONFIRMATION_STATE');

export const setCsrf = createAction('SET_CSRF');
