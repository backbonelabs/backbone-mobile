import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './app/reducers';
import Application from './app/containers/Application';
import theme from './app/styles/theme';
import './app/utils/Bugsnag';

EStyleSheet.build(theme);

const store = createStore(
  reducers,
  applyMiddleware(thunk)
);

const Backbone = () => (
  <Provider store={store}>
    <Application />
  </Provider>
);

AppRegistry.registerComponent('backbone', () => Backbone);
