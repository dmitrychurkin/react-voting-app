import { all } from 'redux-saga/effects';
import formActionSaga from 'redux-form-saga';
import { loginWatcherSaga, signInWatcherSaga } from './app.sagas';


export default function* rootSaga() {
  try {
    yield all([
      signInWatcherSaga(),
      loginWatcherSaga(),
      formActionSaga()
    ]);
  } catch (err) {
    console.log('Error occured in rootSaga', err);
  }
}