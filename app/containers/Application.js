import React, { Component, PropTypes } from 'react';
import {
  Alert,
  AppState,
  View,
  Image,
  StatusBar,
  Navigator,
  NativeModules,
  NativeEventEmitter,
  Platform,
  TouchableOpacity,
  BackAndroid,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { clone } from 'lodash';
import sessionActive from '../images/sessionActive.png';
import sessionInactive from '../images/sessionInactive.png';
import settingsActive from '../images/settingsActive.png';
import settingsInactive from '../images/settingsInactive.png';
import appActions from '../actions/app';
import authActions from '../actions/auth';
import deviceActions from '../actions/device';
import postureActions from '../actions/posture';
import FullModal from '../components/FullModal';
import PartialModal from '../components/PartialModal';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import TitleBar from '../components/TitleBar';
import Banner from '../components/Banner';
import routes from '../routes';
import styles from '../styles/application';
import theme from '../styles/theme';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';
import Mixpanel from '../utils/Mixpanel';

const { bluetoothStates, deviceModes, deviceStatuses, storageKeys } = constants;

const {
  BluetoothService,
  DeviceManagementService,
  Environment,
  SessionControlService,
} = NativeModules;

const BluetoothServiceEvents = new NativeEventEmitter(BluetoothService);
const SessionControlServiceEvents = new NativeEventEmitter(SessionControlService);
const DeviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);

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
        showFull: PropTypes.bool,
        showPartial: PropTypes.bool,
        content: PropTypes.node,
        onClose: PropTypes.func,
      }),
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

    this.navigator = null; // Components should use this custom navigator object
    this.backAndroidListener = null;
  }

  componentWillMount() {
    // Load config variables
    this.props.dispatch(appActions.setConfig(Environment));

    // ANDROID ONLY: Listen to the hardware back button to either navigate back or exit app
    if (!isiOS) {
      this.backAndroidListener = BackAndroid.addEventListener('hardwareBackPress', () => {
        if (this.props.app.modal.showFull || this.props.app.modal.showPartial) {
          // There is a modal being displayed, hide it
          this.props.dispatch(appActions.hideFullModal());
          this.props.dispatch(appActions.hidePartialModal());
          return true;
        }

        const routeStack = this.navigator.getCurrentRoutes();
        const currentRoute = routeStack[routeStack.length - 1];
        if (currentRoute.name === routes.postureMonitor.name) {
          // Delegate to the PostureMonitor to handle this scenario
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
    BluetoothService.getState((error, { state }) => {
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
      BluetoothService.getIsEnabled()
        .then(isEnabled => !isEnabled && BluetoothService.enable());
    }

    // Handle changes from the Bluetooth adapter
    this.bluetoothListener = BluetoothServiceEvents.addListener('BluetoothState', ({ state }) => {
      this.props.dispatch({
        type: 'UPDATE_BLUETOOTH_STATE',
        payload: state,
      });

      if (state === bluetoothStates.OFF) {
        this.props.dispatch(deviceActions.disconnect());
        Alert.alert('Error', 'Bluetooth is off');
      }
    });

    // Handle changes in the device connection status at the app level
    this.deviceStateListener = BluetoothServiceEvents.addListener('DeviceState', ({ state }) => {
      switch (state) {
        case deviceStatuses.CONNECTED:
          // Retrieve session state
          SessionControlService.getSessionState();
          break;
        case deviceStatuses.DISCONNECTED:
          // Dispatch disconnect action when the device is disconnected
          this.props.dispatch(deviceActions.didDisconnect());

          const routeStack = this.navigator.getCurrentRoutes();
          const currentRoute = routeStack[routeStack.length - 1];
          if (currentRoute.name === routes.firmwareUpdate.name) {
            // This indicates a running firmware update was interrupted
            // Return to the previous scene
            this.navigator.pop();

            Alert.alert('Error', 'Connection lost. Your Backbone update has failed.');
          }
          break;
        default:
          // no-op
      }
    });

    // Handle SessionState events
    this.sessionStateListener = SessionControlServiceEvents.addListener('SessionState', event => {
      if (event.hasActiveSession) {
        // There is an active session, check if we're on the PostureMonitor scene
        if (this.navigator) {
          const routeStack = this.navigator.getCurrentRoutes();
          const currentRoute = routeStack[routeStack.length - 1];
          if (currentRoute.name !== routes.postureMonitor.name) {
            // Not currently on the PostureMonitor scene
            // Navigate to PostureMonitor to resume session using previous session parameters
            SensitiveInfo.getItem(storageKeys.SESSION_STATE)
              .then(prevSessionState => {
                const parameters = {};
                if (prevSessionState) {
                  Object.assign(parameters, prevSessionState.parameters);
                  this.props.dispatch(
                    postureActions.setSessionTime(prevSessionState.parameters.sessionDuration * 60)
                  );
                }

                // Hacky workaround:
                // When the device gets disconnected while on the PostureMonitor scene and
                // the user decides to leave the scene, and then reconnects to the device
                // outside the PostureMonitor scene, the DeviceConnect scene will call
                // popToRoute or replace on the Navigator. However, we get into a race condition
                // where this navigate action may cause the PostureMonitor to be inserted into
                // the route stack before popToRoute or replace is called. If that happens, the
                // PostureMonitor scene will be unmounted.
                // This hack will navigate to PostureMonitor after a short delay to minimize
                // the chances of such a race condition.
                setTimeout(() => {
                  this.navigate({
                    ...routes.postureMonitor,
                    props: {
                      sessionState: {
                        ...parameters,
                        sessionState: prevSessionState.state,
                        timeElapsed: event.totalDuration,
                        slouchTime: event.slouchTime,
                      },
                    },
                  });
                }, 250);
              });
          }
        }
      }
    });

    // Add a listener to the ConnectionStatus event
    this.connectionStatusListener = DeviceManagementServiceEvents.addListener('ConnectionStatus',
      status => {
        this.props.dispatch(deviceActions.connectStatus(status));
        if (status.message) {
          Mixpanel.trackError({
            errorContent: status,
            path: 'app/containers/Application',
            stackTrace: ['componentWillMount', 'DeviceManagementServiceEvents.addListener'],
          });
        } else if (status.deviceMode === deviceModes.BOOTLOADER) {
          // When the device failed to load the normal Backbone services,
          // we should proceed to show firmware update related UI
          Alert.alert('Error', 'There is something wrong with your Backbone. ' +
            'Perform an update now to continue using your Backbone.', [
            { text: 'Cancel', onPress: () => this.props.dispatch(deviceActions.disconnect()) },
            { text: 'Update', onPress: () => this.navigator.push(routes.firmwareUpdate) },
            ]
          );
        }
      }
    );

    // Listen to when the app switches between foreground and background
    AppState.addEventListener('change', this.handleAppStateChange);

    // Allows us to differentiate between development / production events
    Mixpanel.registerSuperProperties({ DEV_MODE: Environment.DEV_MODE === 'true' });

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
            // Fetch device info
            this.props.dispatch(deviceActions.getInfo());

            // Specify user account to track event for
            Mixpanel.identify(this.props.user._id);

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

                  // Specify user account to track event for
                  Mixpanel.identify(user._id);

                  if (user.hasOnboarded) {
                    // User completed onboarding
                    // Fetch device info
                    this.props.dispatch(deviceActions.getInfo());

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
    if (this.deviceStateListener) {
      this.deviceStateListener.remove();
    }
    if (this.sessionStateListener) {
      this.sessionStateListener.remove();
    }
    if (this.connectionStatusListener) {
      this.connectionStatusListener.remove();
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

  @autobind
  handleAppStateChange(currentAppState) {
    if (currentAppState === 'active') {
      // Fetch device info when app comes back into foreground
      this.props.dispatch(deviceActions.getInfo());

      // Retrieve session state
      SessionControlService.getSessionState();
    }
  }

  @autobind
  configureScene() {
    return CustomSceneConfig;
  }

  @autobind
  navigate(route) {
    const routeStack = this.navigator.getCurrentRoutes();
    const currentRoute = routeStack[routeStack.length - 1];
    if (route.name !== currentRoute.name) {
      // Only navigate if the selected route isn't the current route
      this.navigator.push(route);
    }
  }

  @autobind
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
                <SecondaryText style={{ color: tabBarTextColor }}>{ value.name }</SecondaryText>
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
    }

    const { modal: modalProps } = this.props.app;

    return (
      <View style={{ flex: 1 }}>
        <TitleBar
          navigator={this.navigator}
          currentRoute={route}
        />
        <FullModal show={modalProps.showFull} onClose={modalProps.onClose}>
          {modalProps.content}
        </FullModal>
        { route.showBanner && <Banner navigator={this.navigator} /> }
        <View style={[modalProps.showFull ? hiddenStyles : {}, { flex: 1 }]}>
          <RouteComponent navigator={this.navigator} currentRoute={route} {...route.props} />
          <PartialModal show={modalProps.showPartial} onClose={modalProps.onClose}>
            {modalProps.content}
          </PartialModal>
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
