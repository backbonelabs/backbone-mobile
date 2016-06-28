import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  StatusBar,
} from 'react-native';
import Initiate from './components/Initiate.react';

class backbone extends Component {
  componentWillMount() {
    StatusBar.setBarStyle('light-content', true);
  }

  render() {
    return (
      <Navigator
        initialRoute={{ name: 'Initiate', component: Initiate }}
        renderScene={(route, navigator) => {
          if (route.component) {
            return React.createElement(route.component, { navigator }, { ...route.passProps });
          }
        }
      }
      />
    );
  }
}

AppRegistry.registerComponent('backbone', () => backbone);
