import React, { Component } from 'react';
import Initiate from './components/Initiate.react';
import Menu from './components/Menu.react';

import {
  Text,
  StatusBar,
  Navigator,
  AppRegistry,
  TouchableHighlight,
} from 'react-native';

class backbone extends Component {
  constructor() {
    super();

    this.navigationBarRouteMapper = {
      LeftButton(route, navigator, index, navState) {
      },
      RightButton(route, navigator, index, navState) {
      },
      Title(route, navigator) {
        if (route.name) {
          return (
            <TouchableHighlight onPress={() => { this.showMenu(route, navigator); }}>
              <Text>Menu</Text>
            </TouchableHighlight>
          );
        }
      },
    };

    this.configureScene = this.configureScene.bind(this);
    this.showMenu = this.showMenu.bind(this);
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


  showMenu(route, navigator) {
    const menuItems = {
      main: 'main',
      posture: 'posture',
      activity: 'activity',
    };

    delete menuItems[route.name];

    navigator.push({
      name: 'Menu',
      component: Menu,
      passProps: menuItems,
    });
  }

  renderScene(route, navigator) {
    return React.createElement(route.component, { navigator });
  }

  render() {
    return (
      <Navigator
        navigationBar={<Navigator.NavigationBar routeMapper={this.navigationBarRouteMapper} />}
        configureScene={this.configureScene}
        initialRoute={{ component: Initiate }}
        renderScene={this.renderScene}
      />
    );
  }
}

AppRegistry.registerComponent('backbone', () => backbone);
