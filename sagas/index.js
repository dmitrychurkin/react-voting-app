import { all } from 'redux-saga/effects';
import formActionSaga from 'redux-form-saga';
import { loginWatcherSaga } from './app.sagas';


export default function* rootSaga() {
  try {
    yield all([
      loginWatcherSaga(),
      formActionSaga()
    ]);
  } catch (err) {
    console.log('Error occured in rootSaga', err);
  }
}