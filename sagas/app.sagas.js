import { put, call, takeEvery } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import axios from 'axios';

import { login as loginAction, signIn as signInAction } from '../actions';

export function* loginWatcherSaga() {
  yield takeEvery(loginAction.REQUEST, loginUserSaga);
}

export function* signInWatcherSaga() {
  yield takeEvery(signInAction.REQUEST, signInUserSaga);
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

  try {

    const result = yield call([axios, 'post'], '/sign-in', action.payload);
    yield put(signInAction.success(result));

  }catch(err) {

    let submissionError = {
      signIn: 'Error occured, duaring sign-in',
      _error: 'Sign-in failed, please check your input data and try again'
    };

    if (typeof err.response === 'object') {

      const { status, data } = err.response;
      switch (status) {
        case 400: {
          const errorMessage = Array.isArray(data) ? data.map(({ msg }) => msg).join(', ') : '';
          submissionError = { ...submissionError, ...{ signIn: 'BackendValidationError', _error: errorMessage } };
          break;
        }
      }
      
    }
    console.dir(err);
    
    const formError = new SubmissionError(submissionError);

    yield put(signInAction.failure(formError));

  }
}