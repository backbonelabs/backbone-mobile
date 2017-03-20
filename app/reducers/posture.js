import { SET_SESSION_TIME } from '../actions/types';

export default (state = {
  sessionTimeSeconds: null,
}, action) => {
  switch (action.type) {
    case SET_SESSION_TIME: {
      return {
        ...state,
        sessionTimeSeconds: action.payload,
      };
    }
    default:
      return state;
  }
};
