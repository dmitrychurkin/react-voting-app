import { handleActions, combineActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { login, signIn } from '../actions';

const defaultState = { userLogged: false, error: null, requestSent: false };


const appReducer = handleActions({
  [combineActions(login.REQUEST, signIn.REQUEST, signIn.SUCCESS)]: state => ({ ...state, requestSent: true }),
  [login.SUCCESS]: state => ({ ...state, userLogged: true, requestSent: false }),
  [login.FAILURE]: (state, { payload: { errors } }) => ({ ...state, error: errors.login, requestSent: false }),
  [signIn.FAILURE]: (state, { payload: { errors } }) => ({ ...state, error: errors.signIn, requestSent: false })
}, defaultState);

export default combineReducers({
  app: appReducer,
  form: formReducer
});
