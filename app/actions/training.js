import Mixpanel from '../utils/Mixpanel';
import {
  SELECT_LEVEL,
  SELECT_SESSION,
  SELECT_SESSION_STEP,
  RESTORE_TRAINING_STATE,
} from './types';
import store from '../store';

const getCurrentTrainingData = () => {
  const { training } = store.getState();
  const { selectedPlanIdx, selectedLevelIdx, selectedSessionIdx, selectedStepIdx } = training;
  return { selectedPlanIdx, selectedLevelIdx, selectedSessionIdx, selectedStepIdx };
};

export default {
  /**
   * Sets the current level in a training plan
   * @param {Number} level Index of the level within the training plan
   */
  selectLevel(level) {
    Mixpanel.trackWithProperties('selectLevel', {
      ...getCurrentTrainingData(),
      newLevelIdx: level,
    });

    return {
      type: SELECT_LEVEL,
      payload: level,
    };
  },

  /**
   * Sets the current session in a training plan level
   * @param {Number} session Index of the session within the training plan level
   */
  selectSession(session) {
    Mixpanel.trackWithProperties('selectSession', {
      ...getCurrentTrainingData(),
      newSessionIdx: session,
    });

    return {
      type: SELECT_SESSION,
      payload: session,
    };
  },

  selectSessionStep(step) {
    Mixpanel.trackWithProperties('selectSessionStep', {
      ...getCurrentTrainingData(),
      newStepIdx: step,
    });

    return {
      type: SELECT_SESSION_STEP,
      payload: step,
    };
  },

  restoreTrainingState(trainingState) {
    Mixpanel.trackWithProperties('restoreTrainingState', trainingState);

    return {
      type: RESTORE_TRAINING_STATE,
      payload: trainingState,
    };
  },
};
