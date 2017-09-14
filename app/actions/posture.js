import { SET_SESSION_PARAMETERS } from './types';

export default {
  setSessionParameters(param) {
    return {
      type: SET_SESSION_PARAMETERS,
      payload: param,
    };
  },
};
