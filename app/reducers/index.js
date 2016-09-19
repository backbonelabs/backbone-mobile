import { combineReducers } from 'redux';
import auth from './auth';
import user from './user';
import device from './device';

export default combineReducers({
  auth,
  user,
  device,
});
