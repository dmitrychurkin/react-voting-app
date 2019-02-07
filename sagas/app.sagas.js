import { put, call, takeEvery } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import axios from 'axios';

import { login as loginAction, signIn as signInAction, confirmEmailOnSignin } from '../actions';

export function* loginWatcherSaga() {
  yield takeEvery(loginAction.REQUEST, loginUserSaga);
}

export function* signInWatcherSaga() {
  yield takeEvery(signInAction.REQUEST, signInUserSaga);
}

export function* emailConfirmedSaga() {
  yield take(confirmEmailOnSignin);
  yield put(signInAction.success());
}

function* loginUserSaga(action) {

  const { email, password } = action.payload;

  try {

    yield call([axios, 'post'], '/login', { email, password });

    yield put(loginAction.success());

  }catch(err) {

    console.log('Error occured while user loggin-in');
    //console.error(err);
    const formError = new SubmissionError({
      login: 'User with this login or password is not found',
      _error: 'Login failed, please check your credentials and try again'
    });

    yield put(loginAction.failure(formError));

  }

}

function* signInUserSaga(action) {

  const { firstName, lastName, password, email } = action.payload;

  try {

    yield call([axios, 'post'], '/sign-in', { email, password, firstName, lastName });

  }catch(err) {

    console.log('Error occured while user sign-in');
    //console.error(err);
    const formError = new SubmissionError({
      signIn: 'Error occured, duaring sign-in',
      _error: 'Sign-in failed, please check your input data and try again'
    });

    yield put(signInAction.failure(formError));

  }
}