import get from 'lodash/get';
import {
  FETCH_USER,
  FETCH_USER__START,
  FETCH_USER__ERROR,
  LOGIN,
  LOGIN__START,
  LOGIN__ERROR,
  SIGNUP,
  SELECT_LEVEL,
  SELECT_SESSION,
  SELECT_SESSION_STEP,
  RESTORE_TRAINING_STATE,
  SIGN_OUT,
  UPDATE_USER_TRAINING_PLAN_PROGRESS,
  UPDATE_USER_TRAINING_PLAN_PROGRESS__START,
  UPDATE_USER_TRAINING_PLAN_PROGRESS__ERROR,
} from '../actions/types';
import {
  getNextIncompleteLevel,
  getNextIncompleteSession,
} from '../utils/trainingUtils';

const defaultState = {
  isUpdating: false,
  errorMessage: null,
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
  selectedStepIdx: 0,
};

export default (state = defaultState, action) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_USER__START:
    case LOGIN__START:
    case UPDATE_USER_TRAINING_PLAN_PROGRESS__START: {
      return {
        ...state,
        isUpdating: true,
        errorMessage: null,
      };
    }
    case FETCH_USER:
    case LOGIN:
    case UPDATE_USER_TRAINING_PLAN_PROGRESS: {
      const plans = get(payload, 'trainingPlans', defaultState.plans);

      // For now, default to the first training plan
      // TODO: When we introduce more training plans, we'll need to decide which training
      // plan to default to
      const selectedPlanIdx = state.selectedPlanIdx;
      const plan = plans[selectedPlanIdx];
      let selectedLevelIdx = state.selectedLevelIdx;
      let selectedSessionIdx = state.selectedSessionIdx;
      if (type !== UPDATE_USER_TRAINING_PLAN_PROGRESS && plan) {
        // Automatically set current level and session based on the next incomplete workout for the
        // user, but only on FETCH_USER or LOGIN actions. If there are no more pending levels or
        // sessions, the highest level/session index will be selected. For
        // UPDATE_USER_TRAINING_PLAN_PROGRESS, we keep the currently selected level and session.
        const nextIncompleteLevelIdx = getNextIncompleteLevel(plan.levels);
        selectedLevelIdx = nextIncompleteLevelIdx < 0 ?
          plan.levels.length - 1 : nextIncompleteLevelIdx;
        const nextIncompleteSessionIdx = getNextIncompleteSession(plan.levels[selectedLevelIdx]);
        selectedSessionIdx = nextIncompleteSessionIdx < 0 ?
          plan.levels[selectedLevelIdx].length - 1 : nextIncompleteSessionIdx;
      }

      return {
        ...state,
        isUpdating: false,
        plans,
        selectedPlanIdx,
        selectedLevelIdx,
        selectedSessionIdx,
      };
    }
    case FETCH_USER__ERROR:
    case LOGIN__ERROR:
    case UPDATE_USER_TRAINING_PLAN_PROGRESS__ERROR: {
      return {
        ...state,
        isUpdating: false,
        errorMessage: payload.message,
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
    case SELECT_SESSION_STEP:
      return {
        ...state,
        selectedStepIdx: payload,
      };
    case RESTORE_TRAINING_STATE:
      return {
        ...state,
        ...payload,
      };
    case SIGN_OUT:
      return defaultState;
    default:
      return state;
  }
};
