import { combineReducers } from 'redux';
import auth from './auth';
import user from './user';
import app from './app';
import support from './support';
import posture from './posture';
import device from './device';
import training from './training';

export default combineReducers({
  auth,
  user,
  app,
  support,
  posture,
  device,
  training,
});
