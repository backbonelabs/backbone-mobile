import React from 'react';
import { View } from 'react-native';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import color from 'color';
import TitleBar from '../../app/containers/TitleBar';

describe('TitleBar Component', () => {
  const defaultState = {
    app: {
      titleBar: {
        name: null,
        title: null,
        component: null,
        showLeftComponent: false,
        showRightComponent: false,
        showNavbar: false,
        rightComponent: null,
      },
    },
    training: {
      selectedLevelIdx: 0,
    },
    user: {
      user: {
        nickname: 'testNickname',
      },
    },
  };
  const currentRoute = {
    name: 'testing',
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

  test('renders as expected', () => {
    const store = configuredStore(defaultState);
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} currentRoute={currentRoute} />,
      { context: { store } },
    ).dive();

    expect(wrapper).toMatchSnapshot();
  });

  test('shows a custom left component that receives navigator/nickname as a prop', () => {
    const leftComponent = () => <View />;
    const store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showLeftComponent: true,
          leftComponent,
        },
      },
    });
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} currentRoute={currentRoute} />,
      { context: { store } },
    ).dive();

    const LeftComponentWrapper = wrapper.childAt(0).childAt(0).childAt(0);
    expect(LeftComponentWrapper.name()).toBe('leftComponent');
    expect(LeftComponentWrapper.props()).toHaveProperty('navigator', navigatorWithOneRoute);
    expect(LeftComponentWrapper.props())
      .toHaveProperty('nickname', defaultState.user.user.nickname);
  });

  test('disables the back button', () => {
    const store = configuredStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        titleBar: {
          ...defaultState.app.titleBar,
          showLeftComponent: true,
        },
      },
    });
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithTwoRoutes} disableBackButton currentRoute={currentRoute} />,
      { context: { store } },
    ).dive();
    const touchableWrapper = wrapper.childAt(0).childAt(0);
    const iconWrapper = wrapper.find('Icon').at(0);
    expect(touchableWrapper).toBeDefined();
    expect(iconWrapper).toBeDefined();
    expect(iconWrapper.props()).toHaveProperty('name', 'keyboard-arrow-left');
    expect(iconWrapper.props().style).toEqual(expect.arrayContaining([{
      color: color('rgba(0, 0, 0, 0.54)').clearer(0.6).rgbString(),
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
          showLeftComponent: true,
        },
      },
    });
    let wrapper = shallow(
      <TitleBar navigator={navigatorWithTwoRoutes} currentRoute={currentRoute} />,
      { context: { store } },
    ).dive();
    let expectedStyles = [{ color: 'rgba(0, 0, 0, 0.54)' }];
    let leftProps = wrapper.find('Icon').at(0).props();
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
          showLeftComponent: true,
        },
      },
      training: {
        ...defaultState.training,
        selectedLevelIdx: newLevelIdx,
      },
    });
    wrapper = shallow(
      <TitleBar navigator={navigatorWithTwoRoutes} currentRoute={currentRoute} />,
      { context: { store } },
    ).dive();
    expectedStyles = [{ color: 'rgba(0, 0, 0, 0.54)' }];
    leftProps = wrapper.find('Icon').at(0).props();
    centerProps = wrapper.childAt(1).props();
    expect(leftProps.style).toEqual(expect.arrayContaining(expectedStyles));
    expect(centerProps.style).toEqual(expect.arrayContaining(expectedStyles));
  });

  test('can properly hide the right component', () => {
    const store = configuredStore(defaultState);
    const wrapper = shallow(
      <TitleBar navigator={navigatorWithOneRoute} currentRoute={currentRoute} />,
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
      <TitleBar navigator={navigatorWithOneRoute} currentRoute={currentRoute} />,
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
      <TitleBar navigator={navigatorWithOneRoute} currentRoute={currentRoute} />,
      { context: { store } },
    ).dive();

    const rightComponentWrapper = wrapper.childAt(2).childAt(0).childAt(0);
    expect(rightComponentWrapper.name()).toBe('RightComponent');
    expect(rightComponentWrapper.props()).toHaveProperty('navigator', navigatorWithOneRoute);
  });
});

