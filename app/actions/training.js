import Mixpanel from '../utils/Mixpanel';
import {
  SELECT_LEVEL,
  SELECT_SESSION,
} from './types';
import store from '../store';

const getCurrentTrainingData = () => {
  const { training } = store.getState();
  const { selectedPlanIdx, selectedLevelIdx, selectedSessionIdx } = training;
  return { selectedPlanIdx, selectedLevelIdx, selectedSessionIdx };
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
};
