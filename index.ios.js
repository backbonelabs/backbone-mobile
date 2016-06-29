import React, { Component } from 'react';
import Initiate from './components/Initiate.react';

import {
  StatusBar,
  Navigator,
  AppRegistry,
} from 'react-native';

class backbone extends Component {
  constructor() {
    super();
    this.configureScene = this.configureScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
  }

  componentWillMount() {
    StatusBar.setBarStyle('light-content', true);
  }

  configureScene(route) {
    if (route.name === 'Menu') {
      return Navigator.SceneConfigs.FloatFromBottom;
    }
    return Navigator.SceneConfigs.PushFromRight;
  }

  renderScene(route, navigator) {
    return React.createElement(route.component, { navigator });
  }

  render() {
    return (
      <Navigator
        configureScene={this.configureScene}
        initialRoute={{ component: Initiate }}
        renderScene={this.renderScene}
      />
    );
  }
}

AppRegistry.registerComponent('backbone', () => backbone);
