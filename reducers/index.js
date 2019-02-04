import { createActions, handleActions } from 'redux-actions';

const defaultState = { userLogged: false, error: null, loginStart: true };

export const { loginStart, loginSuccess, loginFail } = createActions({
  LOGIN_START: () => ({ start: true }),
  LOGIN_SUCCESS: result => ({ result }),
  LOGIN_FAIL: error => ({ error })
}); 

export const reducer = handleActions({
  [loginStart]: state => ({...state, loginStart: true}),
  [loginSuccess]: state => ({ ...state, userLogged: true, loginStart: false }),
  [loginFail]: (state, { payload: { error } }) => ({ ...state, error, loginStart: false })
});
