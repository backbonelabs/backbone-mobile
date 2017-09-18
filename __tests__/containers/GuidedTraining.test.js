import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import GuidedTraining from '../../app/containers/GuidedTraining';

describe('GuidedTraining Component', () => {
  const workouts = {
    '5minPosture': {
      _id: '5minposture',
      title: '5-Minute Posture Session',
    },
    chestStretch: {
      _id: 'cheststretch',
      title: 'Chest Stretch',
    },
    noMoney: {
      _id: 'nomoney',
      title: 'No Money',
    },
    catCamel: {
      _id: 'catcamel',
      title: 'Cat Camel',
    },
    bandPullApart: {
      _id: 'bandpullapart',
      title: 'Band Pull-Apart',
    },
  };

  const testPlanId = 'testPlanId';
  const initialState = {
    training: {
      plans: [{
        _id: 'plan1',
        name: 'Starter',
        levels: [
          [
            [{
              title: 'Beginner Chest Stretch',
              workout: workouts.chestStretch,
              isComplete: true,
            }, {
              title: 'Intermediate Upper Back Stretch',
              workout: workouts.noMoney,
              isComplete: false,
            }, {
              title: 'Beginner Posture Session',
              workout: workouts['5minPosture'],
              isComplete: false,
            }],
          ],
          [
            [{
              title: 'Beginner Upper Back Exercise',
              workout: workouts.catCamel,
              isComplete: false,
            }, {
              title: 'Intermediate Upper Back Stretch',
              workout: workouts.bandPullApart,
              isComplete: false,
            }, {
              title: 'Beginner Posture Session',
              workout: workouts['5minPosture'],
              isComplete: false,
            }],
            [{
              title: 'Intermediate Upper Back Stretch',
              workout: workouts.noMoney,
              isComplete: false,
            }, {
              title: 'Beginner Chest Stretch',
              workout: workouts.chestStretch,
              isComplete: false,
            }, {
              title: 'Beginner Posture Session',
              workout: workouts['5minPosture'],
              isComplete: false,
            }],
          ],
        ],
      }],
      selectedPlanIdx: 0,
      selectedLevelIdx: 0,
      selectedSessionIdx: 0,
    },
    user: {
      user: {
        trainingPlanProgress: {
          [testPlanId]: [
            [
              [true],
            ],
          ],
        },
      },
    },
  };
  const store = configureStore([asyncActionMiddleware, thunk])(initialState);
  let wrapper;

  beforeEach(() => {
    store.clearActions();
    wrapper = shallow(
      <GuidedTraining
        planId={testPlanId}
        levelIdx={initialState.training.selectedLevelIdx}
        sessionIdx={initialState.training.selectedSessionIdx}
        workouts={initialState.training.plans[initialState.training.selectedPlanIdx].levels[0][0]}
      />,
      { context: { store } },
    ).dive();
  });

  test('renders as expected', () => {
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: ADD MORE TESTS
});

