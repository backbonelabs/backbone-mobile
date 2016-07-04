import React, { Component } from 'react';
import Menu from './components/Menu.react';
import Initiate from './components/Initiate.react';

import {
  Text,
  View,
  StatusBar,
  Navigator,
  StyleSheet,
  Dimensions,
  AppRegistry,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
  },
  menu: {
    fontSize: 24,
    color: 'white',
  },
  statusBar: {
    height: 25,
    marginTop: -23,
    backgroundColor: '#48BBEC',
  },
  menuButton: {
    height: 75,
    opacity: 0.25,
    alignItems: 'center',
    backgroundColor: 'gray',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
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
        if (route.name !== 'menu') {
          let menuButton = null;
          if (route.name) {
            menuButton = (
            <TouchableHighlight style={styles.menuButton} onPress={() => { context.showMenu(route, navigator); }}>
              <Text style={styles.menu}>MENU</Text>
            </TouchableHighlight>
            );
          } else {
            menuButton = <View />;
          }
          return (
            <View style={styles.container}>
              <View style={styles.statusBar} />
              { menuButton }
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
    if (route.name === 'menu') {
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
      name: 'menu',
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
