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
import Drawer from 'react-native-drawer';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clone } from 'lodash';
import Menu from '../components/Menu';
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

        if (route.showMenu || route.showBackButton) {
          onPressHandler = route.showMenu ? () => this.showMenu(route, navigator) : navigator.pop;
          iconName = route.showMenu ? 'bars' : 'angle-left';

          return (
            <TouchableOpacity style={styles.leftButton} onPress={onPressHandler}>
              <Icon
                name={iconName}
                style={styles.leftButtonIcon}
                size={EStyleSheet.globalVars.$iconSize}
                color={styles._leftButtonIcon.color}
              />
            </TouchableOpacity>
          );
        }
      },
      RightButton: (route, navigator) => route.rightButton && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={() => route.rightButton.onPress(navigator)}
        >
          <Icon
            name={route.rightButton.iconName}
            size={EStyleSheet.globalVars.$iconSize}
            color={EStyleSheet.globalVars.$primaryColor}
          />
        </TouchableOpacity>
      ),
      Title: route => route.title && <Text style={styles.titleText}>{route.title}</Text>,
    };

    this.state = {
      drawerIsOpen: false,
    };

    this.configureScene = this.configureScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
    this.navigator = null;
  }

  componentWillMount() {
    // For Android only, check if Bluetooth is enabled.
    // If not, display prompt for user to enable Bluetooth.
    // This cannot be done on the BluetoothService module side
    // compared to iOS.
    if (Platform.OS === 'android') {
      NativeModules.BluetoothService.getIsEnabled()
        .then(isEnabled => !isEnabled && NativeModules.BluetoothService.enable());
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

    // Alter the push method on the navigator object to include a timestamp for
    // each route in the route stack so that each route in the stack is unique.
    // This prevents React errors when a route is in the stack multiple times.
    if (!this.navigator) {
      this.navigator = clone(navigator);
      this.navigator._push = this.navigator.push; // the original push method
      this.navigator.push = function push(routeObj) {
        return this._push({ ...routeObj, key: Date.now() });
      };
    }

    return (
      <View style={{ flex: 1 }}>
        <StatusBar />
        <RouteComponent navigator={this.navigator} currentRoute={route} {...route.passProps} />
      </View>
    );
  }

  render() {
    return (
      <Drawer
        type="displace"
        content={<Menu
          menuItems={[
            routes.activity.activityDashboard,
            routes.posture.postureDashboard,
            routes.profile,
            routes.settings,
          ]}
          navigate={route => this.navigate(route)}
        />}
        openDrawerOffset={0.3} // right margin when drawer is opened
        open={this.state.drawerIsOpen}
        onClose={() => this.setState({ drawerIsOpen: false })}
        acceptPan={false}
      >
        <Navigator
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
