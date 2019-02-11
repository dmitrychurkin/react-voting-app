import { handleActions, combineActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { login, signIn, setCsrf, emailConfiramtionState } from '../actions';

const defaultState = { 
  userLogged: false, 
  error: null, 
  requestSent: false, 
  csrf: '',
  emailConfirmationState: -1
};


const appReducer = handleActions({
  [combineActions(login.REQUEST, signIn.REQUEST)]: state => ({ ...state, requestSent: true }),
  [login.SUCCESS]: (state, { payload: { userLogged, emailConfirmationState } }) => ({ ...state, userLogged, requestSent: false, emailConfirmationState }),
  [login.FAILURE]: (state, { payload: { errors } }) => ({ ...state, error: errors.login, requestSent: false }),
  [signIn.SUCCESS]: state => ({ ...state, requestSent: false }),
  [signIn.FAILURE]: (state, { payload: { errors } }) => ({ ...state, error: errors.signIn, requestSent: false }),
  [setCsrf]: (state, { payload }) => ({ ...state, csrf: payload }),
  [emailConfiramtionState]: (state, { payload }) => ({ ...state, emailConfirmationState: payload })
}, defaultState);

export default combineReducers({
  app: appReducer,
  form: formReducer
});
