import React from 'react';
import { View } from 'react-native';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import color from 'color';
import TitleBar from '../../app/containers/TitleBar';
import { getColorHexForLevel } from '../../app/utils/levelColors';

describe('TitleBar Component', () => {
  const defaultState = {
    app: {
      titleBar: {
        name: null,
        title: null,
        component: null,
        showBackButton: false,
        showNavbar: false,
        centerComponent: null,
        rightComponent: null,
        styles: {},
      },
    },
    training: {
      selectedLevelIdx: 0,
    },
  };
  const navigatorWithOneRoute = {
    getCurrentRoutes() {
      return [{}];
    },
  };
  const navigatorWithTwoRoutes = {
    getCurrentRoutes() {
      return [{}, {}];
    },
  };
  const configuredStore = configureStore([asyncActionMiddleware, thunk]);
  // let wrapper;

  beforeEach(() => {
    // store.clearActions();
  });

  test('renders as expected', () => {
    const store = configuredStore(defaultState);
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} />,
      { context: { store } },
    ).dive();

    expect(wrapper).toMatchSnapshot();
  });

  test('shows the back button based on the route config', () => {
    // First test back button does not show if showBackButton is falsy
    let store = configuredStore(defaultState);
    let wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} />,
      { context: { store } },
    ).dive();
    expect(wrapper.childAt(0).children()).toHaveLength(0);

    // Test back button does not show if showBackButton is true but there are
    // less than 2 routes in route stack
    store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showBackButton: true,
        },
      },
    });
    wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} />,
      { context: { store } },
    ).dive();
    expect(wrapper.childAt(0).children()).toHaveLength(0);

    // Test back button shows if showBackButton is true and there 2 or more routes in route stack
    wrapper = shallow(
      <TitleBar navigator={navigatorWithTwoRoutes} />,
      { context: { store } },
    ).dive();

    const touchableWrapper = wrapper.childAt(0).childAt(0);
    const iconWrapper = wrapper.childAt(0).childAt(0).childAt(0);

    expect(touchableWrapper).toBeDefined();
    expect(iconWrapper).toBeDefined();
    expect(iconWrapper.props()).toHaveProperty('name', 'keyboard-arrow-left');
  });

  test('disables the back button based on the route config', () => {
    // First test back button does not show if showBackButton is falsy
    const store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showBackButton: true,
        },
      },
    });
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithTwoRoutes} disableBackButton />,
      { context: { store } },
    ).dive();
    const touchableWrapper = wrapper.childAt(0).childAt(0);
    const iconWrapper = wrapper.childAt(0).childAt(0).childAt(0);

    expect(touchableWrapper).toBeDefined();
    expect(iconWrapper).toBeDefined();
    expect(iconWrapper.props()).toHaveProperty('name', 'keyboard-arrow-left');
    expect(iconWrapper.props().style).toEqual(expect.arrayContaining([{
      color: color(getColorHexForLevel(0)).clearer(0.6).rgbString(),
    }]));
  });

  test('uses the correct color style', () => {
    // First test with level index 0
    let store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showBackButton: true,
        },
      },
    });
    let wrapper = shallow(
      <TitleBar navigator={navigatorWithTwoRoutes} />,
      { context: { store } },
    ).dive();
    let expectedStyles = [{ color: getColorHexForLevel(0) }];
    let leftProps = wrapper.childAt(0).childAt(0).childAt(0).props();
    let centerProps = wrapper.childAt(1).props();
    expect(leftProps.style).toEqual(expect.arrayContaining(expectedStyles));
    expect(centerProps.style).toEqual(expect.arrayContaining(expectedStyles));

    // Test with level index 2
    const newLevelIdx = 2;
    store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showBackButton: true,
        },
      },
      training: {
        ...defaultState.training,
        selectedLevelIdx: newLevelIdx,
      },
    });
    wrapper = shallow(
      <TitleBar navigator={navigatorWithTwoRoutes} />,
      { context: { store } },
    ).dive();
    expectedStyles = [{ color: getColorHexForLevel(newLevelIdx) }];
    leftProps = wrapper.childAt(0).childAt(0).childAt(0).props();
    centerProps = wrapper.childAt(1).props();
    expect(leftProps.style).toEqual(expect.arrayContaining(expectedStyles));
    expect(centerProps.style).toEqual(expect.arrayContaining(expectedStyles));
  });

  test('can properly hide the right component', () => {
    const store = configuredStore(defaultState);
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} />,
      { context: { store } },
    ).dive();
    expect(wrapper.childAt(2).children()).toHaveLength(0);
  });

  test('shows the settings icon', () => {
    const store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showRightComponent: true,
        },
      },
    });
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} />,
      { context: { store } },
    ).dive();
    const touchableWrapper = wrapper.childAt(2).childAt(0).childAt(0);

    expect(touchableWrapper.name()).toBe('TouchableOpacity');
    expect(touchableWrapper.childAt(0).name()).toBe('Image');
    expect(touchableWrapper.childAt(0).props()).toHaveProperty('name', 'settingsIcon');
  });

  test('shows a custom right component that receives navigator as a prop', () => {
    const RightComponent = () => <View />;
    const store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showRightComponent: true,
          rightComponent: RightComponent,
        },
      },
    });
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} />,
      { context: { store } },
    ).dive();

    const rightComponentWrapper = wrapper.childAt(2).childAt(0).childAt(0);
    expect(rightComponentWrapper.name()).toBe('RightComponent');
    expect(rightComponentWrapper.props()).toHaveProperty('navigator', navigatorWithOneRoute);
  });
});

