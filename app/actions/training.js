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
