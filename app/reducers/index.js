import { combineReducers } from 'redux';
import auth from './auth';
import user from './user';
import app from './app';
import support from './support';

export default combineReducers({
  auth,
  user,
  app,
  support,
});
