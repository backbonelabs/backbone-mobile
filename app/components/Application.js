import React, { Component } from 'react';
import {
  Alert,
  View,
  StatusBar,
  Navigator,
  NativeModules,
  NativeEventEmitter,
  TouchableHighlight,
} from 'react-native';
import { pick } from 'lodash';
import Drawer from 'react-native-drawer';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import Menu from './Menu';
import routes from '../routes';
import styles from '../styles/application';

const BluetoothService = new NativeEventEmitter(NativeModules.BluetoothService);

const BaseConfig = Navigator.SceneConfigs.FloatFromRight;
const CustomSceneConfig = Object.assign({}, BaseConfig, {
  // A very tighly wound spring will make this transition fast
  springTension: 100,
  springFriction: 1,
  // Use our custom gesture defined above
  gestures: false,
});

class Application extends Component {
  constructor(props) {
    super(props);

    const context = this;

    this.navigationBarRouteMapper = {
      LeftButton() {
      },
      RightButton() {
      },
      Title(route, navigator) {
        let menuButton;
        let settingsButton;

        if (route.showMenu) {
          menuButton = (
            <View style={styles.menuContainer}>
              <TouchableHighlight
                style={styles.menuButton}
                onPress={() => {
                  context.showMenu(route, navigator);
                }}
              >
                <Icon
                  name="bars"
                  style={styles.menuIcon}
                  size={EStyleSheet.globalVars.$iconSize}
                  color={EStyleSheet.globalVars.$primaryColor}
                />
              </TouchableHighlight>
            </View>
          );
        }

        if (route.showSettings) {
          settingsButton = (
            <View style={styles.settingsContainer}>
              <TouchableHighlight
                style={styles.settingsButton}
                onPress={() => {
                  context.showMenu(route, navigator);
                }}
              >
                <Icon
                  name="gear"
                  style={styles.settingsIcon}
                  size={EStyleSheet.globalVars.$iconSize}
                  color={EStyleSheet.globalVars.$primaryColor}
                />
              </TouchableHighlight>
            </View>
          );
        }

        return (
          <View style={styles.navbarContainer}>
            {menuButton}
            {settingsButton}
          </View>
        );
      },
    };

    this.state = {
      drawerIsOpen: false,
    };

    BluetoothService.addListener('BluetoothState', ({ state, stateMap }) => {
      if (state < 5) {
        Alert.alert(
          `Error #${state}`,
          `Bluetooth ${stateMap[state]}`,
        );
      }
    });

    this.configureScene = this.configureScene.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
  }

  componentWillMount() {
    StatusBar.setBarStyle('light-content', true);
  }

  configureScene() {
    return CustomSceneConfig;
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
    const { component: RouteComponent } = route;
    return <RouteComponent navigator={navigator} currentRoute={route} {...route.passProps} />;
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

export default Application;
