import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import Application from './app/containers/Application';
import store from './app/store';
import theme from './app/styles/theme';
import './app/utils/Bugsnag';

EStyleSheet.build(theme);

const Backbone = () => (
  <Provider store={store}>
    <Application />
  </Provider>
);

AppRegistry.registerComponent('backbone', () => Backbone);
