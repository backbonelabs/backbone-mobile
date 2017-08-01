import {
  FETCH_USER,
  LOGIN,
  SIGNUP,
  SELECT_LEVEL,
  SELECT_SESSION,
  SIGN_OUT,
} from '../actions/types';

const defaultState = {
  plans: [{
    name: '',
    levels: [
      [
        [{
          title: '',
          workout: {},
        }],
      ],
    ],
  }],
  selectedPlanIdx: 0,
  selectedLevelIdx: 0,
  selectedSessionIdx: 0,
};

export default (state = defaultState, action) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_USER:
    case LOGIN:
      return {
        ...state,
        plans: payload.trainingPlans,
      };
    case SIGNUP:
      return {
        ...state,
        plans: payload.user.trainingPlans,
      };
    case SELECT_LEVEL:
      return {
        ...state,
        selectedLevelIdx: payload,
      };
    case SELECT_SESSION:
      return {
        ...state,
        selectedSessionIdx: payload,
      };
    case SIGN_OUT:
      return defaultState;
    default:
      return state;
  }
};
