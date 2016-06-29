import React, { Component } from 'react';
import Menu from './components/Menu.react';
import Initiate from './components/Initiate.react';

import {
  Text,
  StatusBar,
  Navigator,
  StyleSheet,
  Dimensions,
  AppRegistry,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  menu: {
    fontSize: 24,
    color: 'white',
  },
  statusBar: {
    height: 23,
    backgroundColor: '#48BBEC',
  },
  menuButton: {
    width: Dimensions.get('window').width,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'gray',
  },
});

class backbone extends Component {
  constructor() {
    super();

    const context = this;

    this.navigationBarRouteMapper = {
      LeftButton(route, navigator, index, navState) {
      },
      RightButton(route, navigator, index, navState) {
      },
      Title(route, navigator) {
        if (route.name) {
          return (
            <View>
              <View style={styles.statusBar} />
              <TouchableHighlight
                style={styles.menuButton}
                onPress={() => { context.showMenu(route, navigator); }}
              >
                <Text style={styles.menu}>MENU</Text>
              </TouchableHighlight>
            </View>
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
      passProps: {
        menuItems,
      },
    });
  }

  renderScene(route, navigator) {
    return React.createElement(route.component, { navigator, ...route.passProps });
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
