import { put, call, takeEvery } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import axios from 'axios';

import { 
  login as loginAction, 
  signIn as signInAction,
  emailConfiramtionState,
  logout,
  resendEmailConfirmationToken
} from '../actions';

export function* loginWatcherSaga() {
  yield takeEvery(loginAction.REQUEST, loginUserSaga);
}

export function* signInWatcherSaga() {
  yield takeEvery(signInAction.REQUEST, signInUserSaga);
}

export function* logoutWatcherSaga() {
  yield takeEvery(logout.request, logoutSaga);
}

export function* resentEmailConfirmationTokenWatcherSaga() {
  yield takeEvery(resendEmailConfirmationToken.request, resentEmailConfirmationTokenSaga);
}

function* loginUserSaga(action) {

  try {

    const response = yield call([axios, 'post'], '/login', action.payload);
    console.log('From login saga ', response);
    yield put(loginAction.success(response));

  }catch(err) {

    console.log('Error occured while user loggin-in');
    console.dir(err);

    let submissionError = {
      signIn: 'Error occured, duaring login',
      _error: 'Login failed, please check your credentials and try again'
    };

    if (typeof err.response === 'object') {

      const { status } = err.response;
      switch (status) {
        case 401: {
          const errorMessage = 'User with this login or password is not found';
          submissionError = { ...submissionError, ...{ signIn: 'UnauthorizedError', _error: errorMessage } };
          break;
        }
      }
      
    }

    const formError = new SubmissionError(submissionError);

    yield put(loginAction.failure(formError));

  }

}

function* signInUserSaga(action) {

  try {

    const response = yield call([axios, 'post'], '/sign-in', action.payload);
    yield put(signInAction.success(response));
    yield put(emailConfiramtionState(1));

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

function* logoutSaga() {
  console.log('RUN logoutSaga');
  try {

    yield call([axios, 'head'], '/logout');
    yield put(logout.success(true));

  }catch(err) {
    console.log('ERROR OCURED logoutSaga ', err);
    yield put(logout.failure(err.message));

  }

}

function* resentEmailConfirmationTokenSaga() {

  console.log('RUN resentEmailConfirmationTokenSaga');
  try {

    yield call([axios, 'head'], '/resend-email-confirmation');
    yield put(emailConfiramtionState(1));

  }catch(err) {
    console.log('ERROR OCCURED resentEmailConfirmationTokenSaga ', err);
    yield put(resendEmailConfirmationToken.failure(err.message));

  }

}