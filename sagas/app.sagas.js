import { put, call, takeEvery } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import axios from 'axios';

import { login as loginAction } from '../actions';

export function* loginWatcherSaga() {
  yield takeEvery(loginAction.REQUEST, loginUserSaga);
}

function* loginUserSaga(action) {

  const { login, password } = action.payload;

  try {

    yield call([axios, 'post'], '/login', { login, password });

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

function* signInUserSaga({ firstName, lastName, password, email }) {
  try {

  }catch(err) {
    
  }
}