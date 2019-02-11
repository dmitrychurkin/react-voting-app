import { all } from 'redux-saga/effects';
import formActionSaga from 'redux-form-saga';
import { 
  loginWatcherSaga, 
  signInWatcherSaga, 
  logoutWatcherSaga,
  resentEmailConfirmationTokenWatcherSaga
} from './app.sagas';


export default function* rootSaga() {
  try {
    yield all([
      signInWatcherSaga(),
      loginWatcherSaga(),
      formActionSaga(),
      logoutWatcherSaga(),
      resentEmailConfirmationTokenWatcherSaga()
    ]);
  } catch (err) {
    console.log('Error occured in rootSaga', err);
  }
}