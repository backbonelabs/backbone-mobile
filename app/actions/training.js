import {
  SELECT_LEVEL,
  SELECT_SESSION,
} from './types';

export default {
  selectLevel(level) {
    return {
      type: SELECT_LEVEL,
      payload: level,
    };
  },

  selectSession(session) {
    return {
      type: SELECT_SESSION,
      payload: session,
    };
  },
};
