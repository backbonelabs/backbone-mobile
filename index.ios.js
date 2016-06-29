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
    this.configureScene = this.configureScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
  }

  configureScene() {
    return Navigator.SceneConfigs.FloatFromBottom;
  }

  renderScene(route, navigator) {
    return React.createElement(route.component, { navigator });
  }

  render() {
    return (
      <Navigator
        configureScene={this.configureScene}
        initialRoute={{ name: 'Initiate', component: Initiate }}
        renderScene={this.renderScene}
      />
    );
  }
}

AppRegistry.registerComponent('backbone', () => backbone);
