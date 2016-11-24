import React, { Component, PropTypes } from 'react';
import {
  Alert,
  AppState,
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
import { clone } from 'lodash';
import sessionActive from '../images/sessionActive.png';
import sessionInactive from '../images/sessionInactive.png';
import settingsActive from '../images/settingsActive.png';
import settingsInactive from '../images/settingsInactive.png';
import appActions from '../actions/app';
import authActions from '../actions/auth';
import deviceActions from '../actions/device';
import FullModal from '../components/FullModal';
import Spinner from '../components/Spinner';
import TitleBar from '../components/TitleBar';
import Banner from '../components/Banner';
import routes from '../routes';
import styles from '../styles/application';
import theme from '../styles/theme';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';

const { bluetoothStates, storageKeys } = constants;

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
    app: PropTypes.shape({
      modal: PropTypes.shape({
        show: PropTypes.bool,
        content: PropTypes.node,
        onClose: PropTypes.func,
      }),
    }),
    device: PropTypes.shape({
      inProgress: PropTypes.bool,
      isConnected: PropTypes.bool,
    }),
    user: PropTypes.shape({
      _id: PropTypes.string,
    }),
  };

  constructor() {
    super();

    this.state = {
      initializing: true,
      initialRoute: null,
    };

    this.configureScene = this.configureScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
    this.navigator = null; // Components should use this custom navigator object
    this.backAndroidListener = null;
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentWillMount() {
    // Load config variables
    this.props.dispatch(appActions.setConfig(Environment));

    // ANDROID ONLY: Listen to the hardware back button to either navigate back or exit app
    if (!isiOS) {
      this.backAndroidListener = BackAndroid.addEventListener('hardwareBackPress', () => {
        if (this.props.app.modal.show) {
          // There is a modal being displayed, hide it
          this.props.dispatch(appActions.hideFullModal());
          return true;
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

    // Get initial Bluetooth state
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

    // Set up a handler that will process Bluetooth state changes
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

    // Listen to when the app switches between foreground and background
    AppState.addEventListener('change', this.handleAppStateChange);

    // Check if there is a stored access token. An access token
    // would have been saved on a previously successful login
    SensitiveInfo.getItem(storageKeys.ACCESS_TOKEN)
      .then((accessToken) => {
        if (accessToken) {
          // There is a saved access token
          // Dispatch access token to the store
          this.props.dispatch(authActions.setAccessToken(accessToken));

          // Check if there is already a user profile in the Redux store
          if (this.props.user._id) {
            // There is a user profile in the Redux store
            // Attempt to auto connect to device
            this.props.dispatch(deviceActions.attemptAutoConnect());

            // Set initial route to posture dashboard
            this.setInitialRoute(routes.postureDashboard);
          } else {
            // There is no user profile in the Redux store, check local storage
            return SensitiveInfo.getItem(storageKeys.USER)
              .then((user) => {
                if (user) {
                  // There is a user profile in local storage
                  // Dispatch user profile to the Redux store
                  this.props.dispatch({
                    type: 'FETCH_USER',
                    payload: user,
                  });


                  if (user.hasOnboarded) {
                    // User completed onboarding
                    // Attempt to auto connect to device
                    this.props.dispatch(deviceActions.attemptAutoConnect());

                    // Set initial route to posture dashboard
                    this.setInitialRoute(routes.postureDashboard);
                  } else {
                    // User did not complete onboarding, set initial route to onboarding
                    this.setInitialRoute(routes.onboarding);
                  }
                } else {
                  // There is no user profile in local storage
                  this.setInitialRoute();
                }
              });
          }
        } else {
          // There is no saved access token
          this.setInitialRoute();
        }
      })
      .catch(() => {
        this.setInitialRoute();
      });
  }

  componentWillUnmount() {
    if (this.bluetoothListener) {
      this.bluetoothListener.remove();
    }
    if (this.backAndroidListener) {
      this.backAndroidListener.remove();
    }
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  /**
   * Defines the initial scene to mount and ends the initialization process
   * @param {Object} route=routes.welcome Route object, defaults to the welcome route
   */
  setInitialRoute(route = routes.welcome) {
    // Intentionally add a delay because sometimes the initialization process
    // can be so quick that the spinner icon only flashes for a blink of an eye,
    // and it might not be obvious it was a spinner icon indicating some type of
    // background activity. We can remove this if preferred.
    setTimeout(() => {
      this.setState({
        initializing: false,
        initialRoute: route,
      });
    }, 500);
  }

  handleAppStateChange(currentAppState) {
    if (currentAppState === 'active') {
      // Attempt auto-connect when app is brought back into the foreground
      this.props.dispatch(deviceActions.attemptAutoConnect());
    }
  }

  configureScene() {
    return CustomSceneConfig;
  }

  navigate(route) {
    const routeStack = this.navigator.getCurrentRoutes();
    const currentRoute = routeStack[routeStack.length - 1];
    if (route.name !== currentRoute.name) {
      // Only navigate if the selected route isn't the current route
      this.navigator.push(route);
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

    const hiddenStyles = {
      opacity: 0,
      height: 0,
      position: 'absolute',
    };

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
      this.navigator._replace = this.navigator.replace; // the original replace method
      this.navigator.replace = function replace(routeObj) {
        return this._replace({ ...routeObj, key: Date.now() });
      };
    } else {
      // Keep routeStack in sync between both navigators
      this.navigator.state = clone(navigator.state);
    }

    const { modal: modalProps } = this.props.app;

    return (
      <View style={{ flex: 1 }}>
        <TitleBar
          navigator={this.navigator}
          currentRoute={route}
        />
        <FullModal show={modalProps.show} onClose={modalProps.onClose}>
          {modalProps.content}
        </FullModal>
        { route.showBanner && <Banner navigator={this.navigator} /> }
        <View style={[modalProps.show ? hiddenStyles : {}, { flex: 1 }]}>
          <RouteComponent navigator={this.navigator} currentRoute={route} {...route.passProps} />
          { route.showTabBar && TabBar }
        </View>
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
      <View style={{ flex: 1 }}>
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
        {this.state.initializing ? <Spinner /> : (
          <Navigator
            configureScene={this.configureScene}
            initialRoute={this.state.initialRoute}
            renderScene={this.renderScene}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { app, user: { user } } = state;
  return { app, user };
};

export default connect(mapStateToProps)(Application);
