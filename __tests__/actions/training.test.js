import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import trainingActions from '../../app/actions/training';
import Mixpanel from '../../app/utils/Mixpanel';

describe('Training Actions', () => {
  const initialState = {
    training: {
      selectedPlanIdx: 0,
      selectedLevelIdx: 0,
      selectedSessionIdx: 0,
      selectedStepIdx: 0,
    },
  };

  const store = configureStore([asyncActionMiddleware, thunk])(initialState);

  beforeEach(() => {
    store.clearActions();
    Mixpanel.trackWithProperties.mockClear();
  });

  test('creates an action to select a level', async () => {
    const {
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx,
    } = initialState.training;

    await store.dispatch(trainingActions.selectLevel(selectedLevelIdx + 2));
    expect(store.getActions()).toMatchSnapshot();
    expect(Mixpanel.trackWithProperties).toHaveBeenCalledWith('selectLevel', {
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx,
      newLevelIdx: selectedLevelIdx + 2,
    });
  });

  test('creates an action to select a session', async () => {
    const {
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx,
    } = initialState.training;

    await store.dispatch(trainingActions.selectSession(selectedSessionIdx + 2));
    expect(store.getActions()).toMatchSnapshot();
    expect(Mixpanel.trackWithProperties).toHaveBeenCalledWith('selectSession', {
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx,
      newSessionIdx: selectedSessionIdx + 2,
    });
  });
});
