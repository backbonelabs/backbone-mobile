import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Text,
  Image,
  StatusBar,
  Navigator,
  DeviceEventEmitter,
  NativeModules,
  NativeEventEmitter,
  Platform,
  TouchableOpacity,
  BackAndroid,
} from 'react-native';
import { connect } from 'react-redux';
import Drawer from 'react-native-drawer';
import { clone } from 'lodash';
import sessionActive from '../images/sessionActive.png';
import sessionInactive from '../images/sessionInactive.png';
import settingsActive from '../images/settingsActive.png';
import settingsInactive from '../images/settingsInactive.png';
import appActions from '../actions/app';
import FullModal from '../components/FullModal';
import TitleBar from '../components/TitleBar';
import Menu from '../components/Menu';
import routes from '../routes';
import styles from '../styles/application';
import theme from '../styles/theme';
import constants from '../utils/constants';

const { bluetoothStates } = constants;

const {
  BluetoothService: Bluetooth,
  Environment,
} = NativeModules;

const BluetoothService = new NativeEventEmitter(Bluetooth);

const BaseConfig = Navigator.SceneConfigs.FloatFromRight;
const CustomSceneConfig = Object.assign({}, BaseConfig, {
  // A very tighly wound spring will make this transition fast
  springTension: 100,
  springFriction: 1,
  // Use our custom gesture defined above
  gestures: false,
});

const isiOS = Platform.OS === 'ios';

class Application extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    modal: PropTypes.shape({
      show: PropTypes.bool,
      content: PropTypes.node,
      onClose: PropTypes.func,
    }),
  };

  constructor() {
    super();

    this.state = {
      drawerIsOpen: false,
    };

    this.configureScene = this.configureScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
    this.navigator = null; // Components should use this custom navigator object
  }

  componentWillMount() {
    this.props.dispatch(appActions.setConfig(Environment));

    // ANDROID ONLY: Listen to the hardware back button to either navigate back or exit app
    if (!isiOS) {
      BackAndroid.addEventListener('hardwareBackPress', () => {
        if (this.props.modal.show) {
          // There is a modal being displayed, hide it
          this.props.dispatch(appActions.hideFullModal());
        }

        if (this.navigator && this.navigator.getCurrentRoutes().length > 1) {
          // There are subsequent routes after the initial route,
          // so pop the route stack to navigate one scene back
          this.navigator.pop();
          return true;
        }
        // There are no routes to pop, exit app
        return false;
      });
    }

    Bluetooth.getState((error, state) => {
      if (!error) {
        this.props.dispatch({
          type: 'UPDATE_BLUETOOTH_STATE',
          payload: state,
        });
      } else {
        Alert.alert('Error', error);
      }
    });
    // For Android only, check if Bluetooth is enabled.
    // If not, display prompt for user to enable Bluetooth.
    // This cannot be done on the BluetoothService module side
    // compared to iOS.
    if (!isiOS) {
      Bluetooth.getIsEnabled()
        .then(isEnabled => !isEnabled && Bluetooth.enable());
    }

    const handler = ({ state }) => {
      this.props.dispatch({
        type: 'UPDATE_BLUETOOTH_STATE',
        payload: state,
      });

      if (state === bluetoothStates.OFF) {
        Alert.alert('Error', 'Bluetooth is off');
      }
    };

    if (isiOS) {
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
    // Tab bar component data
    const tabBarRoutes = [
      {
        name: 'Session',
        routeName: 'postureDashboard',
        active: sessionActive,
        inactive: sessionInactive,
      },
      {
        name: 'Settings',
        routeName: 'settings',
        active: settingsActive,
        inactive: settingsInactive,
      },
    ];

    // Alter the push method on the navigator object to include a timestamp for
    // each route in the route stack so that each route in the stack is unique.
    // This prevents React errors when a route is in the stack multiple times.
    // All components should use this customized navigator object.
    if (!this.navigator) {
      this.navigator = clone(navigator);
      this.navigator._push = this.navigator.push; // the original push method
      this.navigator.push = function push(routeObj) {
        return this._push({ ...routeObj, key: Date.now() });
      };
    }

    const TabBar = (
      <View style={styles.tabBar}>
        {
          // Iterate through tabBarRoutes and set tab bar item info
          tabBarRoutes.map((value, key) => {
            // Check if current route matches tab bar route
            const isSameRoute = route.name === value.routeName;
            // Set icon to active color if current route matches tab bar route
            const tabBarTextColor = isSameRoute ?
            styles._activeTabBarImage.color : styles._inactiveTabBarImage.color;
            const imageSource = isSameRoute ? value.active : value.inactive;

            return (
              <TouchableOpacity
                key={key}
                style={styles.tabBarItem}
                onPress={() => !isSameRoute && this.navigator.push(routes[value.routeName])}
              >
                <Image source={imageSource} style={styles.tabBarImage} />
                <Text style={{ color: tabBarTextColor }}>{ value.name }</Text>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );

    return this.props.modal.show ? (
      <FullModal onClose={this.props.modal.onClose}>{this.props.modal.content}</FullModal>
    ) : (
      <View style={{ flex: 1 }}>
        <TitleBar
          navigator={this.navigator}
          currentRoute={route}
        />
        <RouteComponent navigator={this.navigator} currentRoute={route} {...route.passProps} />
        { route.showTabBar && TabBar }
      </View>
    );
  }

  render() {
    const statusBarProps = {};
    if (isiOS) {
      statusBarProps.barStyle = 'light-content';
    } else {
      statusBarProps.backgroundColor = theme.primaryColor;
    }

    return (
      <Drawer
        type="displace"
        content={<Menu
          menuItems={[
            routes.activity.activityDashboard,
            routes.postureDashboard,
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
        <StatusBar {...statusBarProps} />
        {isiOS &&
          // The background color cannot be set for the status bar in iOS, so
          // a static View is overlayed on top of the status bar for all scenes
          <View
            style={{
              backgroundColor: theme.primaryColor,
              height: theme.statusBarHeight,
            }}
          />
        }
        <Navigator
          configureScene={this.configureScene}
          initialRoute={routes.welcome}
          renderScene={this.renderScene}
        />
      </Drawer>
    );
  }
}

const mapStateToProps = (state) => {
  const { app } = state;
  return app;
};

export default connect(mapStateToProps)(Application);
