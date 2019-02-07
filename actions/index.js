import { createAction } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';

export const login = createFormAction('LOGIN');

export const signIn = createFormAction('SIGN-IN');

export const confirmEmailOnSignin = createAction('CONFIRM_EMAIL_ON_SIGNIN');