import { combineReducers } from 'redux';
import auth from './auth';
import user from './user';
import device from './device';
import generic from './generic';

export default combineReducers({
  auth,
  user,
  device,
  generic,
});
