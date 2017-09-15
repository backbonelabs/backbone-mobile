import { SET_SESSION_PARAMETERS } from '../actions/types';

export default (state = {
  sessionTimeSeconds: null,
  isGuidedTraining: null,
}, action) => {
  switch (action.type) {
    case SET_SESSION_PARAMETERS: {
      return {
        ...state,
        ...action.payload,
      };
    }
    default:
      return state;
  }
};
