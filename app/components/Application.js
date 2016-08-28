import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  StatusBar,
  Navigator,
  DeviceEventEmitter,
  NativeModules,
  NativeEventEmitter,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { pick } from 'lodash';
import Drawer from 'react-native-drawer';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import Menu from './Menu';
import routes from '../routes';
import styles from '../styles/application';
import constants from '../utils/constants';

const { bluetoothStates } = constants;

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
  constructor() {
    super();

    this.navigationBarRouteMapper = {
      LeftButton: (route, navigator) => {
        let onPressHandler;
        let iconName;

        if (route.showMenu || route.backButton) {
          onPressHandler = route.showMenu ? () => this.showMenu(route, navigator) : navigator.pop;
          iconName = route.showMenu ? 'bars' : 'caret-square-o-left';

          return (
            <TouchableOpacity style={styles.leftButton} onPress={onPressHandler}>
              <Icon
                name={iconName}
                style={styles.menuIcon}
                size={EStyleSheet.globalVars.$iconSize}
                color={styles._menuIcon.color}
              />
            </TouchableOpacity>
          );
        }
      },
      RightButton: (route, navigator) => {
        if (route.rightButton) {
          return route.rightButton({
            navigator,
            navStyle: styles.rightButton,
            iconSize: EStyleSheet.globalVars.$iconSize,
          });
        }
      },
      Title: (route) => {
        if (route.title) {
          return (
            <Text style={styles.navbarContainer}>
              {route.title}
            </Text>
          );
        }
      },
    };

    this.state = {
      drawerIsOpen: false,
    };

    this.configureScene = this.configureScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
  }

  componentWillMount() {
    // For Android only, check if Bluetooth is enabled.
    // If not, display prompt for user to enable Bluetooth.
    // This cannot be done on the BluetoothService module side
    // compared to iOS.
    if (Platform.OS === 'android') {
      NativeModules.BluetoothService.getIsEnabled()
        .then(isEnabled => {
          if (!isEnabled) {
            NativeModules.BluetoothService.enable();
          }
        });
    }

    const handler = ({ state }) => {
      if (state === bluetoothStates.OFF) {
        Alert.alert(
          `Error #${state}`,
          'Bluetooth is disabled'
        );
      }
    };

    if (Platform.OS === 'ios') {
      this.bluetoothListener = BluetoothService.addListener('BluetoothState', handler);
    } else {
      this.bluetoothListener = DeviceEventEmitter.addListener('BluetoothState', handler);
    }
  }

  componentWillUnmount() {
    if (this.bluetoothListener) {
      this.bluetoothListener.remove();
    }
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
    return (
      <View style={{ flex: 1 }}>
        <StatusBar />
        <RouteComponent navigator={navigator} currentRoute={route} {...route.passProps} />
      </View>
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

export default Application;
