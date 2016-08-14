import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Navigator,
  AppRegistry,
  TouchableHighlight,
} from 'react-native';
import { pick } from 'lodash';
import Drawer from 'react-native-drawer';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import routes from './app/routes';
import Menu from './app/components/Menu';
import styles from './app/styles/indexiOS';
import theme from './app/styles/theme';

EStyleSheet.build(theme);

class backbone extends Component {
  constructor() {
    super();

    const context = this;

    this.navigationBarRouteMapper = {
      LeftButton() {
      },
      RightButton() {
      },
      Title(route, navigator) {
        let menuButton;

        if (route.showMenu) {
          menuButton = (
            <TouchableHighlight
              style={styles.menuButton}
              onPress={() => {
                context.showMenu(route, navigator);
              }}
            >
              <Icon
                name="bars"
                style={styles.menuIcon}
                size={30}
                color={EStyleSheet.globalVars.$primaryColor}
              />
            </TouchableHighlight>
          );
        }

        return (
          <View style={styles.container}>
            <View style={styles.statusBar} />
            {menuButton}
          </View>
        );
      },
    };

    this.state = {
      drawerIsOpen: false,
    };

    this.configureScene = this.configureScene.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
  }

  componentWillMount() {
    StatusBar.setBarStyle('light-content', true);
  }

  configureScene() {
    return Navigator.SceneConfigs.PushFromRight;
  }

  showMenu() {
    this.setState({ drawerIsOpen: true });
  }

  navigate(route) {
    const routeStack = this.navigator.getCurrentRoutes();
    const currentRoute = routeStack[routeStack.length - 1];
    if (route.name !== currentRoute.name) {
      // Only navigate if the selected route isn't the current route
      this.navigator.push(route);
    }
    if (this.state.drawerIsOpen) {
      this.setState({ drawerIsOpen: false });
    }
  }

  renderScene(route, navigator) {
    return React.createElement(
      route.component,
      {
        navigator,
        currentRoute: route,
        ...route.passProps,
      }
    );
  }

  render() {
    return (
      <Drawer
        type="displace"
        content={<Menu
          menuItems={pick(routes, ['activity', 'posture'])}
          navigate={route => this.navigate(route)}
        />}
        openDrawerOffset={0.3} // right margin when drawer is opened
        open={this.state.drawerIsOpen}
        onClose={() => this.setState({ drawerIsOpen: false })}
        acceptPan={false}
      >
        <Navigator
          ref={ref => {
            this.navigator = ref;
          }}
          navigationBar={<Navigator.NavigationBar routeMapper={this.navigationBarRouteMapper} />}
          configureScene={this.configureScene}
          initialRoute={routes.home}
          renderScene={this.renderScene}
        />
      </Drawer>
    );
  }
}

AppRegistry.registerComponent('backbone', () => backbone);
