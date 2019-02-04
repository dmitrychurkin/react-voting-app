import { put } from 'redux-saga/effects';
import {
  loginFail
} from '../reducers';

export function* loginUser({ email, password }) {
  try {

  }catch(err) {
    yield put(loginFail(err));
  }
}