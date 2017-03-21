import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import reducers from './reducers';

export default createStore(
  reducers,
  applyMiddleware(asyncActionMiddleware, thunk)
);
