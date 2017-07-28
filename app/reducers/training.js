import {
  FETCH_USER,
  LOGIN,
  SIGNUP,
  SELECT_LEVEL,
} from '../actions/types';

export default (state = {
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
}, action) => {
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
    default:
      return state;
  }
};
