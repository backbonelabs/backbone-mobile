import { combineReducers } from 'redux';
import auth from './auth';
import user from './user';
import app from './app';
import device from './device';

export default combineReducers({
  auth,
  user,
  app,
  device,
});
