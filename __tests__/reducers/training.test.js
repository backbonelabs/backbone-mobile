import {
  SELECT_LEVEL,
  SELECT_SESSION,
} from '../../app/actions/types';
import trainingReducer from '../../app/reducers/training';

describe('Training Reducer', () => {
  const initialState = {
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

  test('should return initial state', () => {
    const trainingState = trainingReducer(initialState, {});
    expect(trainingState).toMatchSnapshot();
    expect(trainingState).toEqual(initialState);
  });

  test('should handle SELECT_LEVEL', () => {
    const newLevel = 1;
    const trainingState = trainingReducer(initialState, {
      type: SELECT_LEVEL,
      payload: newLevel,
    });
    expect(trainingState).toEqual({
      ...initialState,
      selectedLevelIdx: newLevel,
    });
    expect(trainingState).toMatchSnapshot();
  });

  test('should handle SELECT_SESSION', () => {
    const newSession = 2;
    const trainingState = trainingReducer(initialState, {
      type: SELECT_SESSION,
      payload: newSession,
    });
    expect(trainingState).toEqual({
      ...initialState,
      selectedSessionIdx: newSession,
    });
    expect(trainingState).toMatchSnapshot();
  });
});
