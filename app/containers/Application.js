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
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import { clone } from 'lodash';
import { UPDATE_BLUETOOTH_STATE } from '../actions/types';
import sessionActive from '../images/sessionActive.png';
import sessionInactive from '../images/sessionInactive.png';
import settingsActive from '../images/settingsActive.png';
import settingsInactive from '../images/settingsInactive.png';
import deviceLowBatteryIcon from '../images/settings/device-low-battery-icon.png';
import deviceFirmwareIcon from '../images/settings/device-firmware-icon.png';
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
import Bugsnag from '../utils/Bugsnag';
import Mixpanel from '../utils/Mixpanel';

const { bluetoothStates, deviceModes, deviceStatuses, storageKeys } = constants;

const {
  BluetoothService,
  DeviceManagementService,
  Environment,
  SessionControlService,
  DeviceInformationService,
  UserService,
} = NativeModules;

const BluetoothServiceEvents = new NativeEventEmitter(BluetoothService);
const SessionControlServiceEvents = new NativeEventEmitter(SessionControlService);
const DeviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);
const DeviceInformationServiceEvents = new NativeEventEmitter(DeviceInformationService);

const BaseConfig = Navigator.SceneConfigs.FloatFromRight;
const CustomSceneConfig = Object.assign({}, BaseConfig, {
  // A very tighly wound spring will make this transition fast
  springTension: 100,
  springFriction: 1,
  // Use our custom gesture defined above
  gestures: false,
});

const isiOS = Platform.OS === 'ios';

const statusBarProps = {
  barStyle: 'dark-content',
  backgroundColor: 'white',
};

class Application extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    app: PropTypes.shape({
      modal: PropTypes.shape({
        showFull: PropTypes.bool,
        showPartial: PropTypes.bool,
        content: PropTypes.node,
        config: PropTypes.shape({
          topView: PropTypes.node,
          title: PropTypes.shape({
            caption: PropTypes.string,
            color: PropTypes.string,
          }),
          detail: PropTypes.shape({
            caption: PropTypes.string,
            color: PropTypes.string,
          }),
          buttons: PropTypes.array,
          backButtonHandler: PropTypes.func,
        }),
        onClose: PropTypes.func,
      }),
    }),
    user: PropTypes.shape({
      _id: PropTypes.string,
      nickname: PropTypes.string,
      email: PropTypes.string,
    }),
    device: PropTypes.shape({
      selfTestStatus: PropTypes.bool,
      isUpdatingFirmware: PropTypes.bool,
      device: PropTypes.shape({
        batteryLevel: PropTypes.number,
      }),
    }),
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      initializing: true,
      initialRoute: null,
      hasDisplayedLowBatteryWarning: false,
      isFetchingSessionState: false,
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
        const routeStack = this.navigator.getCurrentRoutes();
        const currentRoute = routeStack[routeStack.length - 1];
        if (currentRoute.name === routes.postureMonitor.name) {
          // Delegate to the PostureMonitor to handle this scenario
          return true;
        }

        const { showFull } = this.props.app.modal;
        if (showFull) {
          // There is a full modal being displayed, dismiss it.
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
    BluetoothService.getState((error, { state }) => {
      if (!error) {
        this.props.dispatch({
          type: UPDATE_BLUETOOTH_STATE,
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
        type: UPDATE_BLUETOOTH_STATE,
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
          // Retrieve device info
          this.props.dispatch(deviceActions.getInfo());

          // Check for previous session
          this.checkActiveSession();
          break;
        case deviceStatuses.DISCONNECTED:
          // Dispatch disconnect action when the device is disconnected
          this.props.dispatch(deviceActions.didDisconnect());
          break;
        default:
          // no-op
      }
    });

    this.deviceTestStatusListener = DeviceInformationServiceEvents.addListener('DeviceTestStatus',
      ({ message, success }) => {
        if (message) {
          const routeStack = this.navigator.getCurrentRoutes();
          const currentRoute = routeStack[routeStack.length - 1];

          Mixpanel.trackWithProperties('selfTest-error', {
            errorMessage: message,
          });

          this.props.dispatch(deviceActions.selfTestUpdated(false));

          this.props.dispatch(appActions.showPartialModal({
            topView: (
              <Image source={deviceFirmwareIcon} />
            ),
            title: {
              caption: 'Update Needed',
              color: theme.warningColor,
            },
            detail: {
              caption: 'Your Backbone sensor needs to be fixed.\n' +
              'Perform an update now to continue using your Backbone.',
            },
            buttons: [
              {
                caption: 'CANCEL',
                onPress: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              },
              {
                caption: 'UPDATE',
                onPress: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                  this.props.dispatch(deviceActions.setPendingUpdate());

                  if (currentRoute.name !== routes.device.name) {
                    this.navigator.push(routes.device);
                  }
                },
              },
            ],
          }));
        } else {
          const result = (success ? 'success' : 'failed');
          Mixpanel.track(`selfTest-${result}`);

          this.props.dispatch(deviceActions.selfTestUpdated(success));
        }
      });

    // Handle SessionState events
    this.sessionStateListener = SessionControlServiceEvents.addListener('SessionState', event => {
      if (this.state.isFetchingSessionState) {
        const routeStack = this.navigator.getCurrentRoutes();
        const postureRouteName = routes.postureMonitor.name;
        const isPostureMonitorActive = routeStack.some(route => route.name === postureRouteName);

        // Check if we are not yet in the postureMonitor
        if (!isPostureMonitorActive) {
          if (event.hasActiveSession) {
            // There is an active session,
            if (this.navigator) {
              // Not currently on the PostureMonitor scene
              // Navigate to PostureMonitor to resume session using previous session parameters
              SensitiveInfo.getItem(storageKeys.SESSION_STATE)
                .then(prevSessionState => {
                  const parameters = {};
                  if (prevSessionState) {
                    Object.assign(parameters, prevSessionState.parameters);
                    this.props.dispatch(
                      postureActions.setSessionTime(parameters.sessionDuration * 60)
                    );

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
                  }
                });
            }
          } else {
            // Redirect to the postureMonitor to show the summary
            SensitiveInfo.getItem(storageKeys.SESSION_STATE)
              .then(prevSessionState => {
                if (prevSessionState) {
                  setTimeout(() => {
                    this.navigate({
                      ...routes.postureMonitor,
                      props: {
                        sessionState: {
                          showSummary: true,
                          previousSessionEvent: event,
                        },
                      },
                    });
                  }, 250);
                }
              });
          }
        }

        this.setState({ isFetchingSessionState: false });

        this.props.dispatch(appActions.hidePartialModal());
      }
    });

    // Add a listener to the ConnectionStatus event
    this.connectionStatusListener = DeviceManagementServiceEvents.addListener('ConnectionStatus',
      status => {
        if (status.message) {
          Mixpanel.trackError({
            errorContent: status,
            path: 'app/containers/Application',
            stackTrace: ['componentWillMount', 'DeviceManagementServiceEvents.addListener'],
          });
        } else if (this.navigator !== null) {
          const routeStack = this.navigator.getCurrentRoutes();
          const currentRoute = routeStack[routeStack.length - 1];
          const delay = (currentRoute.name === routes.deviceConnect.name ? 1000 : 0);

          if (status.deviceMode === deviceModes.BOOTLOADER) {
            // When the device failed to load the normal Backbone services,
            // we should proceed to show firmware update related UI.
            // Delay is needed when transitioning from the deviceConnect scene
            // to prevent corrupted navigation stack if the user promptly tap
            // on the 'Update' button while the deviceConnect scene is being popped.
            setTimeout(() => {
              this.props.dispatch(appActions.showPartialModal({
                topView: (
                  <Image source={deviceFirmwareIcon} />
                ),
                title: {
                  caption: 'Update Needed',
                  color: theme.warningColor,
                },
                detail: {
                  caption: 'There is something wrong with your Backbone. ' +
                  'Perform an update now to continue using your Backbone.',
                },
                buttons: [
                  {
                    caption: 'CANCEL',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                      this.props.dispatch(deviceActions.disconnect());
                    },
                  },
                  {
                    caption: 'UPDATE',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                      this.props.dispatch(deviceActions.setPendingUpdate());

                      if (currentRoute.name !== routes.device.name) {
                        this.navigator.push(routes.device);
                      }
                    },
                  },
                ],
              }));
            }, delay);
          } else if (!status.selfTestStatus) {
            // Self-Test failed, request a re-run
            Mixpanel.track('selfTest-begin');

            DeviceInformationService.requestSelfTest();
            this.props.dispatch(deviceActions.selfTestRequested());
          } else {
            this.props.dispatch(deviceActions.selfTestUpdated(status.selfTestStatus));
          }
        }

        this.props.dispatch(deviceActions.connectStatus(status));
      }
    );

    // Check if we need to prepare for restoring previously saved session
    SensitiveInfo.getItem(storageKeys.SESSION_STATE)
      .then(prevSessionState => {
        if (prevSessionState) {
          this.props.dispatch(deviceActions.restoreSavedSession());
        }
      });

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

          // Check for a saved user in local storage
          return SensitiveInfo.getItem(storageKeys.USER)
            .then((user) => {
              if (user) {
                // There is a user profile in local storage
                // Dispatch user profile to the Redux store
                this.props.dispatch({
                  type: 'FETCH_USER',
                  payload: user,
                });

                const id = user._id;

                // Store user id on the native side
                UserService.setUserId(id);

                // Identify user for Bugsnag
                Bugsnag.setUser(id, user.nickname, user.email);

                // Identify user for Mixpanel
                Mixpanel.identify(id);

                if (user.hasOnboarded) {
                  // User completed onboarding
                  // Check for a saved device
                  return SensitiveInfo.getItem(storageKeys.DEVICE)
                    .then((device) => {
                      if (device) {
                        // There is a saved device, attempt to connect to it
                        this.props.dispatch(deviceActions.connect(device.identifier));
                      }
                      // Set initial route to posture dashboard
                      this.setInitialRoute(routes.settings);
                    });
                }
                // User did not complete onboarding, set initial route to onboarding
                this.setInitialRoute(routes.onboarding);
              } else {
                // There is no user profile in local storage
                this.setInitialRoute();
              }
            });
        }
        // There is no saved access token
        this.setInitialRoute();
      })
      .catch(() => {
        this.setInitialRoute();
      });
  }

  // Alerts the user when the Backbone's battery drops to 15% or lower.
  // Alert will only trigger once during the lifetime of the app.
  componentWillReceiveProps(nextProps) {
    if (!this.state.hasDisplayedLowBatteryWarning) {
      const { batteryLevel } = nextProps.device.device;
      if (batteryLevel <= 15 && batteryLevel > 0) {
        this.setState({ hasDisplayedLowBatteryWarning: true });
        this.props.dispatch(appActions.showPartialModal({
          topView: (<Image source={deviceLowBatteryIcon} />),
          title: { caption: 'Low Battery', color: theme.warningColor },
          detail: {
            caption: `Your Backbone battery is at ${batteryLevel}%. ` + // eslint-disable-line prefer-template, max-len
            'Charge your Backbone as soon as possible.',
          },
          buttons: [{ caption: 'CLOSE' }],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      }
    }
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
    if (this.deviceTestStatusListener) {
      this.deviceTestStatusListener.remove();
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
   * @param {Object} route=routes.login Route object, defaults to the login route
   */
  setInitialRoute(route = routes.login) {
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
      // Fetch device info when app comes back into foreground
      this.props.dispatch(deviceActions.getInfo());

      // Skip the session check if the app's not yet ready
      if (this.navigator) {
        // Check if we really have to check for active session.
        // Skip this when the user's still on the posture monitor
        const routeStack = this.navigator.getCurrentRoutes();
        const postureRouteName = routes.postureMonitor.name;
        const isPostureMonitorActive = routeStack.some(route => route.name === postureRouteName);

        // Only refresh device data when not on postureMonitor
        if (!isPostureMonitorActive) {
          // Check for previous session
          this.checkActiveSession();
        }
      }
    }
  }

  checkActiveSession() {
    // If the device failed the self-test, we shouldn't attempt to recover any sessions
    if (!this.props.device.selfTestStatus) {
      return;
    }

    SensitiveInfo.getItem(storageKeys.SESSION_STATE)
      .then(prevSessionState => {
        if (prevSessionState) {
          // Check if we really have to check for active session.
          // Skip this when the user's still on the posture monitor
          const routeStack = this.navigator.getCurrentRoutes();
          const postureRouteName = routes.postureMonitor.name;
          const shouldShowLoading = !(routeStack.some(route => route.name === postureRouteName));
          const { showPartial, showFull } = this.props.app.modal;

          // Only display if no other pop-ups are visible
          if (shouldShowLoading && !showPartial && !showFull) {
            this.props.dispatch(appActions.showPartialModal({
              topView: (<Spinner style={styles._partialSpinnerContainer} />),
              title: { caption: 'Loading' },
              detail: { caption: 'Checking for previous session' },
            }));

            // Start fetching the previous session state
            setTimeout(() => {
              this.setState({ isFetchingSessionState: true });
              SessionControlService.getSessionState();

              // Time-limit of 4 seconds for fetching it
              setTimeout(() => {
                if (this.state.isFetchingSessionState) {
                  this.setState({ isFetchingSessionState: false });
                  this.props.dispatch(appActions.hidePartialModal());
                }
              }, 4000);
            }, 1000);
          }
        }
      });
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

  /**
   * Leaves a Bugsnag breadcrumb for marking when a navigation begins
   * @param {Object} route Route to navigate to
   */
  leaveNavStartBreadcrumb(route) {
    Bugsnag.leaveBreadcrumb(`Navigating to ${route.name}`, {
      type: 'navigation',
      routeConfig: JSON.stringify(route),
    });
  }

  /**
   * Leaves a Bugsnag breadcrumb for marking when a navigation ends
   * @param {Object} route Route navigated to
   */
  leaveNavEndBreadcrumb(route) {
    Bugsnag.leaveBreadcrumb(`Navigated to ${route.name}`, {
      type: 'navigation',
      routeConfig: JSON.stringify(route),
    });
  }

  renderScene(route, navigator) {
    const { component: RouteComponent } = route;
    // Tab bar component data
    const tabBarRoutes = [
      {
        name: 'Session',
        routeName: 'dashboard',
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
                onPress={() => {
                  if (!isSameRoute) {
                    // Reset the navigator stack if not on the dashboard so
                    // the nav stack won't continue to expand.
                    if (route.name === routes.dashboard.name) {
                      this.navigator.push(routes[value.routeName]);
                    } else {
                      this.navigator.resetTo(routes[value.routeName]);
                    }
                  }
                }
              }
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

    // Sets up a custom navigator object with customized navigator methods which adds a
    // timestamp to each route in the route stack. Having the timestamp for each route in
    // the route stack will ensure each route in the stack is unique to prevent React errors
    // when a route is in the stack multiple times.
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

      this.navigator._resetTo = this.navigator.resetTo; // the original resetTo method
      this.navigator.resetTo = function resetTo(routeObj) {
        return this._resetTo({ ...routeObj, key: Date.now() });
      };
    }

    const { modal: modalProps } = this.props.app;
    const routeStack = this.navigator.getCurrentRoutes();
    const currentRoute = routeStack[routeStack.length - 1];

    return (
      <View style={{ flex: 1 }}>
        <TitleBar
          navigator={this.navigator}
          currentRoute={currentRoute}
          disableBackButton={this.props.device.isUpdatingFirmware}
        />
        <FullModal show={modalProps.showFull} onClose={modalProps.onClose}>
          {modalProps.content}
        </FullModal>
        { route.showBanner && <Banner navigator={this.navigator} /> }
        <View style={[modalProps.showFull ? hiddenStyles : {}, { flex: 1 }]}>
          <RouteComponent navigator={this.navigator} currentRoute={currentRoute} {...route.props} />
          <PartialModal
            show={modalProps.showPartial}
            config={modalProps.config}
          >
            {modalProps.content}
          </PartialModal>
          { route.showTabBar && TabBar }
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar {...statusBarProps} />
        {isiOS &&
          // The background color cannot be set for the status bar in iOS, so
          // a static View is overlayed on top of the status bar for all scenes
          <View
            style={{
              backgroundColor: 'white',
              height: theme.statusBarHeight,
            }}
          />
        }
        {this.state.initializing ? <Spinner /> : (
          <Navigator
            configureScene={this.configureScene}
            initialRoute={this.state.initialRoute}
            renderScene={this.renderScene}
            onWillFocus={this.leaveNavStartBreadcrumb}
            onDidFocus={this.leaveNavEndBreadcrumb}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { app, user: { user }, device } = state;
  return { app, user, device };
};

export default connect(mapStateToProps)(Application);
