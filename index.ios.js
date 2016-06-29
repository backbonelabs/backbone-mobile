import React, { Component } from 'react';
import Initiate from './components/Initiate.react';

import {
  AppRegistry,
  Navigator,
  StatusBar,
} from 'react-native';

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
            return React.createElement(route.component, { navigator });
          }
        }
      }
      />
    );
  }
}

AppRegistry.registerComponent('backbone', () => backbone);
