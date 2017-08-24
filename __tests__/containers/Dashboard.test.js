import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import Dashboard from '../../app/containers/Dashboard';
import { SHOW_PARTIAL_MODAL } from '../../app/actions/types';

describe('Dashboard Component', () => {
  const navigator = {
    push: () => {},
  };
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
      }, {
        _id: 'plan2',
        name: 'Home',
        levels: [
          [
            [{
              title: 'Beginner Chest Stretch',
              workout: workouts.chestStretch,
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
          [
            [{
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
              title: 'Intermediate Upper Back Stretch',
              workout: workouts.bandPullApart,
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
          plan1: [
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
      <Dashboard navigator={navigator} />,
      { context: { store } },
    ).dive();
  });

  test('renders as expected', () => {
    expect(wrapper).toMatchSnapshot();
  });

  test('dispatches SHOW_PARTIAL_MODAL if there are no training plans', () => {
    const newStore = configureStore([asyncActionMiddleware, thunk])({
      training: {
        plans: [],
      },
      user: {
        user: {
          trainingPlanProgress: {},
        },
      },
    });

    wrapper = shallow(
      <Dashboard navigator={navigator} />,
      { context: { store: newStore } },
    ).dive({
      lifecycleExperimental: true,
    });
    const action = newStore.getActions()[0];
    expect(action.type).toBe(SHOW_PARTIAL_MODAL);
    expect(action.payload).toHaveProperty('detail', {
      caption: 'Please sign out and sign back in to refresh your account with training plans',
    });
  });

  test('renders a ScrollView with the correct number of levels', () => {
    const scrollViewWrapper = wrapper.find('ScrollViewMock');
    expect(scrollViewWrapper.exists());

    const {
      plans,
      selectedPlanIdx,
    } = initialState.training;
    expect(scrollViewWrapper.children()).toHaveLength(plans[selectedPlanIdx].levels.length);
  });

  // This test fails due to an error potentially caused by the react-native-mock on the Animated
  // module. We use animations in the scroll.
  xtest('calls the scroll handler when the ScrollView has a scroll event', () => {
    const scrollViewWrapper = wrapper.find('ScrollViewMock');
    const instance = wrapper.instance();
    instance._onScroll = jest.fn();
    const testEvent = {
      nativeEvent: {
        contentOffset: {
          y: 50,
        },
      },
    };
    scrollViewWrapper.simulate('scroll', testEvent);
    expect(instance._onScroll).toBeCalledWith(testEvent);
  });

  test('renders a Carousel with the correct number of sessions', () => {
    const carouselWrapper = wrapper.find('Carousel');
    expect(carouselWrapper.exists());

    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
    } = initialState.training;
    expect(carouselWrapper.props().items)
      .toHaveLength(plans[selectedPlanIdx].levels[selectedLevelIdx].length);
  });

  test('passes the correct initial session item to the session Carousel on render', () => {
    const carouselWrapper = wrapper.find('Carousel');
    expect(carouselWrapper.props().firstItem).toBe(initialState.training.selectedSessionIdx);
  });
});

