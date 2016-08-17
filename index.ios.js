import React, { Component } from 'react';
import {
  View,
  Alert,
  StatusBar,
  Navigator,
  Dimensions,
  AppRegistry,
  NativeModules,
  NativeEventEmitter,
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

const BluetoothService = new NativeEventEmitter(NativeModules.BluetoothService);

EStyleSheet.build(theme);

const { width } = Dimensions.get('window');
const BaseConfig = Navigator.SceneConfigs.FloatFromRight;

const CustomLeftToRightGesture = Object.assign({}, BaseConfig.gestures.pop, {
  // Make it snap back really quickly after canceling pop
  snapVelocity: 8,
  // Make it so we can drag anywhere on the screen
  edgeHitWidth: width,
});

const CustomSceneConfig = Object.assign({}, BaseConfig, {
  // A very tighly wound spring will make this transition fast
  springTension: 100,
  springFriction: 1,
  // Use our custom gesture defined above
  gestures: {
    pop: CustomLeftToRightGesture,
  },
});

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
            {menuButton}
          </View>
        );
      },
    };

    this.state = {
      drawerIsOpen: false,
    };

    BluetoothService.addListener('CentralState', ({ state, stateMap }) => {
      if (state < 5) {
        Alert.alert(
          `Error Code ${state}`,
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
