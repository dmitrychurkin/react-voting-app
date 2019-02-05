import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import rootSaga from './sagas';
import rootReducer from './reducers';


const sagaMiddleware = createSagaMiddleware();

export default initialState => {

  const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
  
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(sagaMiddleware))
  );

  store.runSaga = () => {
    // This we need to prevent from running twice
    if (store.saga) {
      return;
    }
    store.saga = sagaMiddleware.run(rootSaga);
  };

  store.stopSaga = async () => {
    if (!store.saga) {
      return;
    }
    store.dispatch(END);
    await store.saga.done;
    store.saga = null;
  };

  store.execSagaTasks = async (isServer, tasks) => {
    store.runSaga();
    tasks(store.dispatch);
    await store.stopSaga();
    if (!isServer) {
      store.runSaga();
    }
  };

  store.runSaga();

  return store;

};

