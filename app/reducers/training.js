import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import {
  FETCH_USER,
  LOGIN,
  SIGNUP,
  SELECT_LEVEL,
  SELECT_SESSION,
  SIGN_OUT,
} from '../actions/types';
import {
  getNextIncompleteLevel,
  getNextIncompleteSession,
} from '../utils/trainingUtils';

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
    case LOGIN: {
      const userTrainingPlans = get(payload, 'trainingPlans', defaultState.plans);
      const trainingPlanProgress = get(payload, 'trainingPlanProgress', {});

      // Make a deep clone of the training plans
      const plans = cloneDeep(userTrainingPlans);

      // Iterate through user's training plan progress and add an isComplete flag to each
      // workout in the training plan clone to indicate whether user completed it or not
      forEach(trainingPlanProgress, (levels, planId) => {
        const plan = plans.find(_plan => _plan._id === planId);
        if (plan) {
          forEach(levels, (level, levelIdx) => {
            forEach(level, (session, sessionIdx) => {
              forEach(session, (workoutResult, workoutIdx) => {
                plan.levels[levelIdx][sessionIdx][workoutIdx].isComplete = workoutResult;
              });
            });
          });
        }
      });

      // For now, default to the first training plan
      // TODO: When we introduce more training plans, we'll need to decide which training
      // plan to default to
      const selectedPlanIdx = 0;
      const plan = plans[selectedPlanIdx];

      let selectedLevelIdx = 0;
      let selectedSessionIdx = 0;
      if (plan) {
        selectedLevelIdx = Math.max(0, getNextIncompleteLevel(plan.levels));
        selectedSessionIdx = Math.max(0, getNextIncompleteSession(plan.levels[selectedLevelIdx]));
      }

      return {
        ...state,
        plans,
        selectedPlanIdx,
        selectedLevelIdx,
        selectedSessionIdx,
      };
    }
    case SIGNUP:
      return {
        ...defaultState,
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
