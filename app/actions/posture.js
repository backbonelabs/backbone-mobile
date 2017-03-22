import { SET_SESSION_TIME } from './types';

export default {
  setSessionTime(seconds) {
    return {
      type: SET_SESSION_TIME,
      payload: seconds,
    };
  },
};
