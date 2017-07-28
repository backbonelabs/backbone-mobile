import {
  SELECT_LEVEL,
} from './types';

export default {
  selectLevel(level) {
    return {
      type: SELECT_LEVEL,
      payload: level,
    };
  },
};
