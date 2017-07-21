import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Image,
  StatusBar,
  Navigator,
  NativeModules,
  Platform,
  TouchableOpacity,
  BackAndroid,
} from 'react-native';
import autobind from 'class-autobind';
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
import PartialModal from '../components/PartialModal';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import TitleBar from '../components/TitleBar';
import BodyText from '../components/BodyText';
import Banner from '../components/Banner';
import routes from '../routes';
import styles from '../styles/application';
import theme from '../styles/theme';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';
import Bugsnag from '../utils/Bugsnag';
import Mixpanel from '../utils/Mixpanel';

const { storageKeys } = constants;

const {
  Environment,
  SessionControlService,
  UserService,
} = NativeModules;

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
        hideClose: PropTypes.bool,
      }),
    }),
    user: PropTypes.shape({
      _id: PropTypes.string,
      nickname: PropTypes.string,
      email: PropTypes.string,
    }),
    device: PropTypes.shape({
      selfTestStatus: PropTypes.bool,
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
        const { showFull, showPartial, hideClose } = this.props.app.modal;
        if ((showFull || showPartial) && !hideClose) {
          // There is a modal being displayed, hide it when allowed
          this.props.dispatch(appActions.hideFullModal());
          this.props.dispatch(appActions.hidePartialModal());
          return true;
        }

        if (this.navigator) {
          const routeStack = this.navigator.getCurrentRoutes();
          const currentRoute = routeStack[routeStack.length - 1];
          if (currentRoute.name === routes.postureMonitor.name) {
            // Delegate to the PostureMonitor to handle this scenario
            return true;
          } else if (this.navigator.getCurrentRoutes().length > 1) {
            // There are subsequent routes after the initial route,
            // so pop the route stack to navigate one scene back
            this.navigator.pop();
            return true;
          }
        }

        // There are no routes to pop, exit app
        return false;
      });
    }

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
                  this.setInitialRoute(routes.postureDashboard);
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
        Alert.alert(
          'Your Backbone battery is low',
          `Your Backbone battery is at ${batteryLevel}%. Charge your Backbone as soon as possible.`
        );
      }
    }
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
              content: (
                <View>
                  <View>
                    <BodyText style={styles._partialModalBodyText}>
                      Checking for previous session
                    </BodyText>
                  </View>
                  <View style={styles.partialSpinnerContainer}>
                    <Spinner />
                  </View>
                </View>
              ),
              hideClose: true,
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
                onPress={() => {
                  if (!isSameRoute) {
                    // Reset the navigator stack if not on the posture dashboard so
                    // the nav stack won't continue to expand.
                    if (route.name === routes.postureDashboard.name) {
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
        />
        <FullModal show={modalProps.showFull} onClose={modalProps.onClose}>
          {modalProps.content}
        </FullModal>
        { route.showBanner && <Banner navigator={this.navigator} /> }
        <View style={[modalProps.showFull ? hiddenStyles : {}, { flex: 1 }]}>
          <RouteComponent navigator={this.navigator} currentRoute={currentRoute} {...route.props} />
          <PartialModal
            show={modalProps.showPartial}
            onClose={modalProps.onClose}
            hideClose={modalProps.hideClose}
          >
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
