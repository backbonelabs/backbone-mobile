import React, { Component, PropTypes } from 'react';
import {
  AppState,
  View,
  Image,
  Vibration,
  NativeModules,
  NativeEventEmitter,
  Platform,
  BackAndroid,
} from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import { debounce, isEqual, isFunction } from 'lodash';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import color from 'color';
import styles from '../../styles/posture/postureMonitor';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import SecondaryText from '../../components/SecondaryText';
import Spinner from '../../components/Spinner';
import MonitorButton from './postureMonitor/MonitorButton';
import Monitor from './postureMonitor/Monitor';
import MonitorSlider from './postureMonitor/MonitorSlider';
import appActions from '../../actions/app';
import deviceActions from '../../actions/device';
import userActions from '../../actions/user';
import routes from '../../routes';
import constants from '../../utils/constants';
import Mixpanel from '../../utils/Mixpanel';
import SensitiveInfo from '../../utils/SensitiveInfo';
import theme from '../../styles/theme';
import vertebraeIcon from '../../images/vertebrae-icon.png';
import deviceErrorIcon from '../../images/settings/device-error-icon.png';
import deviceWarningIcon from '../../images/settings/device-warning-icon.png';
import deviceSuccessIcon from '../../images/settings/device-success-icon.png';
import { zeroPadding } from '../../utils/timeUtils';
import { markSessionStepComplete, isTrainingPlanComplete } from '../../utils/trainingUtils';

const {
  BluetoothService,
  NotificationService,
  SessionControlService,
  VibrationMotorService,
} = NativeModules;

const {
  deviceStatuses,
  sessionOperations,
  storageKeys,
  vibrationDurations,
  notificationTypes,
} = constants;

const BluetoothServiceEvents = new NativeEventEmitter(BluetoothService);
const SessionControlServiceEvents = new NativeEventEmitter(SessionControlService);

const MIN_POSTURE_THRESHOLD = 0.03;
const MAX_POSTURE_THRESHOLD = 0.3;
const currentRange = MAX_POSTURE_THRESHOLD - MIN_POSTURE_THRESHOLD;

const isiOS = Platform.OS === 'ios';

/**
 * Scales a value to the given range.
 * @param  {Number} value value to normalize
 * @param  {Number} min   min of range
 * @param  {Number} max   max of range
 * @return {Number}       Value scaled in new range
 */
const normalizeValue = (value, min, max) => (((value - MIN_POSTURE_THRESHOLD) / currentRange)
* (max - min)) + min;

/**
 * Monitor pointerPosition prop requires a number between -30-210(inclusive) for the pointer,
 * @param  {Number} distance Deviation from the control point
 * @return {Number}          Distance value scaled in a range of -30-210
 */
const getPointerPosition = distance => {
  const normalizedDistance = Math.floor(normalizeValue(distance, 210, -30));
  if (normalizedDistance > 210) {
    return 210;
  } else if (normalizedDistance < -30) {
    return -30;
  }
  return normalizedDistance;
};

/**
 * Monitor slouchPosition prop requires a number between 0-100(inclusive) for the arc,
 * so we scale the distance to a range of 0-100
 * @param  {Number} distance Deviation from the control point
 * @return {Number}          Distance value scaled in a range of 0-100
 */
const getSlouchPosition = distance => Math.floor(normalizeValue(distance, 100, 0));

/**
 * Returns a number at a given magnitude
 * @param  {Number} number    The original number
 * @param  {Number} magnitude The order of magnitude
 * @return {Number}           The number at the provided order of magnitude
 */
const numberMagnitude = (number, magnitude) => number * Math.pow(10, magnitude);

const sessionStates = {
  STOPPED: 0,
  RUNNING: 1,
  PAUSED: 2,
};

class PostureMonitor extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      getCurrentRoutes: PropTypes.func,
      resetTo: PropTypes.func,
      push: PropTypes.func,
      pop: PropTypes.func,
    }),
    currentRoute: PropTypes.shape({
      name: PropTypes.string,
    }),
    app: PropTypes.shape({
      modal: PropTypes.shape({
        showPartial: PropTypes.bool,
      }),
      overrideBackButton: PropTypes.bool,
    }),
    training: PropTypes.shape({
      plans: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,
        })
      ),
      selectedPlanIdx: PropTypes.number,
      selectedLevelIdx: PropTypes.number,
      selectedSessionIdx: PropTypes.number,
      selectedStepIdx: PropTypes.number,
    }),
    posture: PropTypes.shape({
      sessionTimeSeconds: PropTypes.number.isRequired,
      isGuidedTraining: PropTypes.bool,
    }),
    device: PropTypes.shape({
      errorMessage: PropTypes.string,
      device: PropTypes.shape({
        identifier: PropTypes.string,
      }),
      isConnected: PropTypes.bool,
      isConnecting: PropTypes.bool,
    }),
    sessionState: PropTypes.shape({
      sessionState: PropTypes.number,
      timeElapsed: PropTypes.number,
      slouchTime: PropTypes.number,
      sessionDuration: PropTypes.number,
      slouchDistanceThreshold: PropTypes.number,
      vibrationSpeed: PropTypes.number,
      vibrationPattern: PropTypes.oneOf([1, 2, 3]),
      showSummary: PropTypes.bool,
      previousSessionEvent: PropTypes.shape({
        hasActiveSession: PropTypes.bool,
        totalDuration: PropTypes.number,
        slouchTime: PropTypes.number,
      }),
    }),
    user: PropTypes.shape({
      trainingPlanProgress: PropTypes.objectOf(
        PropTypes.arrayOf(
          PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.bool)
          )
        )
      ),
      settings: PropTypes.shape({
        phoneVibration: PropTypes.bool.isRequired,
        postureThreshold: PropTypes.number.isRequired,
        vibrationStrength: PropTypes.number.isRequired,
        backboneVibration: PropTypes.bool.isRequired,
        slouchNotification: PropTypes.bool.isRequired,
        vibrationPattern: PropTypes.oneOf([1, 2, 3]).isRequired,
      }).isRequired,
      _id: PropTypes.string.isRequired,
      dailyStreak: PropTypes.number.isRequired,
      lastSession: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    autobind(this);
    this.state = {
      attemptReconnect: false,
      sessionState: sessionStates.STOPPED,
      hasPendingSessionOperation: false,
      forceStoppedSession: false,
      postureThreshold: this.props.user.settings.postureThreshold,
      shouldNotifySlouch: true,
      pointerPosition: 210,
      currentDistance: 0,
      totalDuration: 0, // in seconds
      slouchTime: 0, // in seconds
      timeElapsed: 0, // in seconds
      sessionDuration: Math.floor(this.props.posture.sessionTimeSeconds / 60), // in minutes

      // The slouch distance threshold needs to be in ten thousandths of a unit.
      // For example, to represent a distance threshold of 0.2, the value must be 2000.
      // We use Math.floor because sometimes JS will return a double floating point value,
      // which is incompatible with the firmware.
      slouchDistanceThreshold: Math.floor(
                                numberMagnitude(this.props.user.settings.postureThreshold, 4)
                              ),
      vibrationSpeed: this.props.user.settings.vibrationStrength,
      vibrationPattern: this.props.user.settings.backboneVibration ?
                          this.props.user.settings.vibrationPattern : 0,
      ...this.props.sessionState, // Session parameters from a previous active session, if any
    };

    this.sessionDataListener = null;
    this.slouchListener = null;
    this.statsListener = null;
    this.deviceStateListener = null;
    this.sessionStateListener = null;
    this.sessionControlStateListener = null;
    // Debounce update of user posture threshold setting to limit the number of API requests
    this.updateUserPostureThreshold = debounce(this.updateUserPostureThreshold, 1000);
    this.backAndroidListener = null;
  }

  componentWillMount() {
    // Set up listener for posture distance data
    this.sessionDataListener =
      SessionControlServiceEvents.addListener('SessionData', this.sessionDataHandler);

    // Set up listener for slouch event
    this.slouchListener =
      SessionControlServiceEvents.addListener('SlouchStatus', this.slouchHandler);

    // Set up listener for session statistics event
    this.statsListener =
      SessionControlServiceEvents.addListener('SessionStatistics', this.statsHandler);

    // Set up listener for device state event
    this.deviceStateListener = BluetoothServiceEvents.addListener('DeviceState', ({ state }) => {
      if (state === deviceStatuses.DISCONNECTED) {
        // Device got disconnected, prompt user for action
        this.showAlertOnFailedConnection();
      }
    });

    // Set up listener for session state event
    // The session state is requested from Application.js upon connecting to the device
    this.sessionStateListener = SessionControlServiceEvents.addListener('SessionState', event => {
      if (event.hasActiveSession) {
        // There is currently an active session running on the device, resume session
        // only if we are not on the Alert scene
        if (this.props.currentRoute.name === routes.postureMonitor.name
          && this.state.sessionState === sessionStates.RUNNING) {
          this.resumeSession();
        }
      } else {
        // There is no active session running on the device
        this.setState({ forceStoppedSession: true });

        // Show summary
        this.statsHandler(event);
      }
    });

    // Set up listener for session control event
    // To be used for android's interactive notification for session control
    if (!isiOS) {
      this.sessionControlStateListener = SessionControlServiceEvents.addListener(
        'SessionControlState', event => {
          switch (event.operation) {
            case sessionOperations.PAUSE: {
              this.setSessionState({
                state: sessionStates.PAUSED,
                parameters: {
                  sessionDuration: this.state.sessionDuration,
                  slouchDistanceThreshold: this.state.slouchDistanceThreshold,
                  vibrationSpeed: this.state.vibrationSpeed,
                  vibrationPattern: this.state.vibrationPattern,
                },
              });

              break;
            }
            case sessionOperations.RESUME: {
              const {
                sessionDuration,
                slouchDistanceThreshold,
                vibrationSpeed,
                vibrationPattern,
              } = this.state;

              const sessionParameters = {
                sessionDuration,
                slouchDistanceThreshold,
                vibrationSpeed,
                vibrationPattern,
              };

              this.setSessionState({
                state: sessionStates.RUNNING,
                parameters: {
                  sessionDuration,
                  ...sessionParameters,
                },
              });

              // Navigate back to posture monitor if app was in alerts and resumed
              // through Android's interactive notifications
              if (this.props.currentRoute.name === routes.alerts.name) {
                this.props.navigator.pop();
              }

              break;
            }
            case sessionOperations.STOP:
              break;
            default:
              break;
          }
        }
      );
    }

    // ANDROID ONLY: Listen to the hardware back button
    if (!isiOS) {
      this.backAndroidListener = BackAndroid.addEventListener('hardwareBackPress', () => {
        if (this.props.sessionState && this.props.sessionState.showSummary) {
          this.props.navigator.resetTo(routes.dashboard);
        } else if (this.state.sessionState !== sessionStates.STOPPED
          && !this.state.hasPendingSessionOperation && !this.props.app.modal.showPartial) {
          // Back button was pressed during an active session.
          // Check if PostureMonitor is the current scene.
          if (this.props.currentRoute.name === routes.postureMonitor.name) {
            // PostureMonitor is the current scene.
            // Confirm if the user wants to quit the current session.
            this.confirmStopSession();
          }
        }
      });
    }

    AppState.addEventListener('change', this.handleAppStateChange);

    if (this.props.sessionState && this.props.sessionState.showSummary) {
      this.setState({ forceStoppedSession: true }, () => {
        this.statsHandler(this.props.sessionState.previousSessionEvent);
      });
    } else {
      const { sessionState } = this.state;
      if (sessionState === sessionStates.PAUSED) {
        // There is an active session that's paused
        // Sync app to a paused state
        this.pauseSession();
      } else if (sessionState === sessionStates.RUNNING) {
        // There is an active session that's running
        // Sync app to a running state
        this.resumeSession();
      } else {
        // There is no active session
        // Automatically start a new session
        this.startSession();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.user.settings, nextProps.user.settings)) {
      // User settings changed
      // Store new settings in component store because we use the store values for
      // starting and resuming a session
      const {
        postureThreshold,
        vibrationStrength,
        backboneVibration,
        vibrationPattern,
      } = nextProps.user.settings;

      this.setState({
        slouchDistanceThreshold: Math.floor(numberMagnitude(postureThreshold, 4)),
        vibrationSpeed: vibrationStrength,
        vibrationPattern: backboneVibration ? vibrationPattern : 0,
      });
    }

    if (this.props.device.isConnecting && !nextProps.device.isConnecting) {
      if (!this.props.device.errorMessage && nextProps.device.errorMessage) {
        // There was an error on connect, prompt user for action
        this.showAlertOnFailedConnection();
      } else if (!this.props.device.isConnected && nextProps.device.isConnected) {
        // Reconnect success, proceed to display success alert
        this.showReconnectSuccessIndicator();
      }
    }

    if (!this.props.app.overrideBackButton && nextProps.app.overrideBackButton) {
      this.confirmStopSession();
      this.props.dispatch(appActions.toggleOverrideBackButton(false));
    }
  }

  componentWillUnmount() {
    const { forceStoppedSession, sessionState } = this.state;
    // End the session if it's running and not yet stopped
    if (!forceStoppedSession && sessionState !== sessionStates.STOPPED) {
      // Force stop any session and skip the confirmation to allow immediate
      // update to the session state on the native side
      SessionControlService.stop(false, () => {
        // no-op
      });
    }

    // Remove listeners
    this.sessionDataListener.remove();
    this.slouchListener.remove();
    this.statsListener.remove();
    this.deviceStateListener.remove();
    this.sessionStateListener.remove();

    if (this.sessionControlStateListener) {
      this.sessionControlStateListener.remove();
    }

    if (this.backAndroidListener) {
      this.backAndroidListener.remove();
    }

    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  /**
   * Displays the session time remaining/elapsed in H:MM:SS or M:SS format. For timed sessions,
   * the time remaining will be displayed. For untimed sessions, the time elapsed will be displayed.
   * @return {String} Time remaining/elapsed in H:MM:SS or M:SS format
   */
  getFormattedTime() {
    const totalSessionTime = this.props.posture.sessionTimeSeconds;
    const timeElapsed = this.state.timeElapsed;
    const totalSeconds = totalSessionTime === 0 ?
                          timeElapsed :
                          totalSessionTime - timeElapsed;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    const seconds = totalSeconds % 60;

    const lpad = number => {
      if (number < 10) {
        return `0${number}`;
      }
      return number;
    };

    const timeArray = [];
    if (hours) {
      timeArray[0] = hours;
      timeArray[1] = lpad(minutes);
      timeArray[2] = lpad(seconds);
    } else {
      timeArray[0] = minutes;
      timeArray[1] = lpad(seconds);
    }
    return timeArray.join(':');
  }

  /**
   * Keeps track of the session state and parameters
   * @param {Object}   session
   * @param {Number}   session.state      Session state
   * @param {Object}   session.parameters Session parameters
   * @param {Function} [callback]         Optional callback to invoke after setting state
   */
  setSessionState(session, callback) {
    const { isGuidedTraining } = this.props.posture;
    const { state, parameters } = session;
    const {
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx,
    } = this.props.training;

    if ((state === sessionStates.RUNNING || state === sessionStates.PAUSED) && parameters) {
      // Store session state in local storage in case the app exits
      // and relaunches while the session is still active on the device
      SensitiveInfo.setItem(storageKeys.SESSION_STATE, {
        state,
        parameters,
        trainingState: {
          selectedPlanIdx,
          selectedLevelIdx,
          selectedSessionIdx,
          selectedStepIdx,
        },
        isGuidedTraining,
      });
    } else if (state === sessionStates.STOPPED) {
      // Remove session state from local storage
      this.props.dispatch(deviceActions.clearSavedSession());
      SensitiveInfo.deleteItem(storageKeys.SESSION_STATE);
    }
    this.setState({ sessionState: state }, () => {
      if (isFunction(callback)) {
        callback();
      }
    });
  }

  handleAppStateChange(currentAppState) {
    if (currentAppState === 'active') {
      // Remove the session completion notification from the tray
      // once the app returns to the foreground state
      NotificationService.clearNotification(notificationTypes.SESSION_COMPLETED);
    }
  }

  showReconnectStartedIndicator() {
    this.props.dispatch(appActions.showPartialModal({
      topView: (<Spinner style={styles.partialSpinnerContainer} />),
      title: {
        caption: 'Reconnecting',
      },
      detail: {
        caption: 'Attempting to reconnect to your BACKBONE',
      },
    }));
  }

  showReconnectSuccessIndicator() {
    this.props.dispatch(appActions.showPartialModal({
      topView: (<Image source={deviceSuccessIcon} />),
      title: {
        caption: 'BACKBONE Reconnected',
        color: theme.green400,
      },
      detail: {
        caption: 'Your BACKBONE has been successfully reconnected',
      },
      buttons: [
        {
          caption: 'CLOSE',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        },
      ],
      backButtonHandler: () => {
        this.props.dispatch(appActions.hidePartialModal());
      },
    }));
  }

  showAlertOnFailedConnection() {
    const { sessionState } = this.state;

    let title = 'Connection Lost';
    let message;
    if (this.state.attemptReconnect) {
      this.setState({ attemptReconnect: false });
      title = 'Connection Failed';
      message = 'Make sure your BACKBONE is in range and charged';
    } else if (sessionState === sessionStates.RUNNING) {
      message = 'Your BACKBONE was disconnected, but BACKBONE is still monitoring ' +
        'your posture!\n\nDo you want to leave and keep the session running on your ' +
        'BACKBONE, or attempt to reconnect to your BACKBONE now to see your posture?';
    } else if (sessionState === sessionStates.PAUSED) {
      message = 'Your BACKBONE was disconnected while your session was paused. ' +
        'Do you want to leave to continue your session later, or attempt to reconnect to your ' +
        'BACKBONE now?';
    } else {
      message = 'Your BACKBONE was disconnected. Do you want to leave or attempt to reconnect to ' +
        'your BACKBONE?';
    }

    this.props.dispatch(appActions.showPartialModal({
      topView: (
        <Image source={deviceErrorIcon} />
      ),
      title: {
        caption: title,
        color: theme.warningColor,
      },
      detail: {
        caption: message,
      },
      buttons: [
        {
          caption: 'LEAVE',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
            this.props.navigator.pop();
          },
        },
        {
          caption: 'RECONNECT',
          onPress: () => {
            this.setState({ attemptReconnect: true });
            this.props.dispatch(deviceActions.connect(this.props.device.device.identifier));
            this.showReconnectStartedIndicator();
          },
        },
      ],
    }));
  }

  /**
   * Updates the pointer based on the distance away from the control point and the time
   * @param {Object} event
   * @param {Number} event.currentDistance How far away the user is from the control point
   * @param {Number} event.timeElapsed     Number of seconds the session has been running
   */
  sessionDataHandler(event) {
    const { currentDistance, timeElapsed } = event;
    this.setState({
      pointerPosition: getPointerPosition(currentDistance),
      timeElapsed,
      currentDistance,
    });

    // Mark the shouldNotifySlouch to true when it's on a good posture state
    // so the app will send the notification once it enters the bad posture state
    const { shouldNotifySlouch, postureThreshold } = this.state;
    if (!shouldNotifySlouch && currentDistance < postureThreshold) {
      // Clear the slouch notification since it's no longer relevant
      // on good posture state
      NotificationService.clearNotification(notificationTypes.SLOUCH_WARNING);
      this.setState({ shouldNotifySlouch: true });
    }
  }

  /**
   * Handles a slouch event.
   *
   * NOTE: THIS IS NOT COMPLETELY IMPLEMENTED AND WILL
   * UNDERGO CHANGES BASED ON HOW WE WANT TO TAILOR THE UX.
   */
  slouchHandler(event) {
    const { isSlouching } = event;
    // TODO: Implement final UX for slouch events
    if (isSlouching) {
      const slouchNotificationEnabled = this.props.user.settings.slouchNotification;

      if (AppState.currentState === 'background'
        && slouchNotificationEnabled && this.state.shouldNotifySlouch) {
        // Attempt to send out a slouch detection notification only on background mode,
        // the slouch notification is enabled, and it was previously on a good posture state
        NotificationService.sendNotification(notificationTypes.SLOUCH_WARNING,
          'Bad posture detected',
          'Fix your posture to look and feel your best!');

        // Prevent sending out more notifications while still on the bad posture state
        this.setState({ shouldNotifySlouch: false });
      }

      if (this.props.user.settings.phoneVibration) {
        // User enabled phone vibration alerts
        // Start a single 1-second phone vibration (the 1-second duration only affects Android;
        // the iOS vibration duration is fixed and defined by the system)
        Vibration.vibrate(1000);
      }
    }
  }

  /**
   * Processes session statistics and displays a summary.
   * @param {Object} event
   * @param {Number} event.totalDuration Total elapsed time of the session, in seconds
   * @param {Number} event.slouchTime    Total slouch time, in seconds
   */
  statsHandler(event) {
    const { totalDuration, slouchTime } = event;
    this.saveUserSession();
    this.setSessionState({ state: sessionStates.STOPPED }, () => {
      this.setState({
        totalDuration,
        slouchTime,
      }, this.showSummary);
    });
  }

  startSession() {
    if (!this.state.hasPendingSessionOperation) {
      const {
        sessionDuration,
        slouchDistanceThreshold,
        vibrationSpeed,
        vibrationPattern,
      } = this.state;

      const sessionParameters = {
        sessionDuration,
        // We use the slouchDistanceThreshold from state instead of user.settings.postureThreshold
        // because the user may modify the threshold and resume the session before the
        // updated threshold value is saved in the database and a response is returned
        // from the API server to refresh the user object in the Redux store.
        slouchDistanceThreshold,
        vibrationSpeed,
        vibrationPattern,
        slouchTimeThreshold: 5,
      };

      Mixpanel.trackWithProperties('startSession', {
        goalDuration: sessionDuration,
      });

      this.setState({ hasPendingSessionOperation: true });

      SessionControlService.start(sessionParameters, err => {
        this.setState({ hasPendingSessionOperation: false });

        if (err) {
          const verb = this.state.sessionState === sessionStates.STOPPED ? 'start' : 'resume';
          const message = `An error occurred while attempting to ${verb} the session.`;
          if (this.state.sessionState === sessionStates.STOPPED) {
            // No session has been started, which means the initial autostart failed, so we should
            // just navigate back since there is nothing else the user can do in this scene
            this.props.dispatch(appActions.showPartialModal({
              title: {
                caption: 'Error',
                color: theme.warningColor,
              },
              detail: { caption: message },
              buttons: [
                {
                  caption: 'OK',
                  onPress: () => {
                    this.props.dispatch(appActions.hidePartialModal());
                    this.props.navigator.pop();
                  },
                },
              ],
              backButtonHandler: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            }));
          } else {
            // A session was already started, so an error here would be for resuming the session
            this.props.dispatch(appActions.showPartialModal({
              title: {
                caption: 'Error',
                color: theme.warningColor,
              },
              detail: { caption: message },
              buttons: [
                {
                  caption: 'Retry',
                  onPress: () => {
                    this.props.dispatch(appActions.hidePartialModal());
                    this.startSession();
                  },
                },
              ],
              backButtonHandler: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            }));
          }

          Mixpanel.trackError({
            errorContent: err,
            path: 'app/components/posture/PostureMonitor',
            stackTrace: ['startSession', 'SessionControlService.start'],
          });
        } else {
          this.setSessionState({
            state: sessionStates.RUNNING,
            parameters: sessionParameters,
          });
        }
      });
    }
  }

  pauseSession() {
    if (!this.state.hasPendingSessionOperation) {
      this.setState({ hasPendingSessionOperation: true });

      Mixpanel.track('pauseSession');

      SessionControlService.pause(err => {
        this.setState({ hasPendingSessionOperation: false });

        if (err) {
          this.props.dispatch(appActions.showPartialModal({
            detail: { caption: 'An error occurred while attempting to pause the session.' },
            buttons: [
              {
                caption: 'Retry',
                onPress: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                  this.pauseSession();
                },
              },
            ],
            backButtonHandler: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          }));

          Mixpanel.trackError({
            errorContent: err,
            path: 'app/components/posture/PostureMonitor',
            stackTrace: ['pauseSession', 'SessionControlService.pause'],
          });
        } else {
          this.setSessionState({
            state: sessionStates.PAUSED,
            parameters: {
              sessionDuration: this.state.sessionDuration,
              slouchDistanceThreshold: this.state.slouchDistanceThreshold,
              vibrationSpeed: this.state.vibrationSpeed,
              vibrationPattern: this.state.vibrationPattern,
            },
          });
        }
      });
    }
  }

  resumeSession() {
    if (!this.state.hasPendingSessionOperation) {
      this.setState({ hasPendingSessionOperation: true });

      const {
        sessionDuration,
        slouchDistanceThreshold,
        vibrationSpeed,
        vibrationPattern,
      } = this.state;

      const sessionParameters = {
        // We use the slouchDistanceThreshold from state instead of user.settings.postureThreshold
        // because the user may modify the threshold and resume the session before the
        // updated threshold value is saved in the database and a response is returned
        // from the API server to refresh the user object in the Redux store.
        slouchDistanceThreshold,
        vibrationSpeed,
        vibrationPattern,
        slouchTimeThreshold: 5,
      };

      Mixpanel.track('resumeSession');

      SessionControlService.resume(sessionParameters, err => {
        this.setState({ hasPendingSessionOperation: false });

        if (err) {
          this.props.dispatch(appActions.showPartialModal({
            title: {
              caption: 'Error',
              color: theme.warningColor,
            },
            detail: { caption: 'An error occurred while attempting to resume the session.' },
            buttons: [
              {
                caption: 'Retry',
                onPress: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                  this.resumeSession();
                },
              },
            ],
            backButtonHandler: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          }));

          Mixpanel.trackError({
            errorContent: err,
            path: 'app/components/posture/PostureMonitor',
            stackTrace: ['resumeSession', 'SessionControlService.resume'],
          });
        } else {
          this.setSessionState({
            state: sessionStates.RUNNING,
            parameters: {
              sessionDuration,
              ...sessionParameters,
            },
          });
        }
      });
    }
  }

  stopSession() {
    if (!this.state.hasPendingSessionOperation) {
      if (this.state.sessionState === sessionStates.STOPPED) {
        // There is no active session
        this.props.dispatch(appActions.showPartialModal({
          title: { caption: 'Exit' },
          detail: { caption: 'Are you sure you want to leave?' },
          buttons: [
            {
              caption: 'Cancel',
              onPress: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            },
            {
              caption: 'Exit',
              onPress: () => {
                this.props.dispatch(appActions.hidePartialModal());
                this.props.navigator.pop();
              },
            },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      } else {
        this.setState({
          hasPendingSessionOperation: true,
          forceStoppedSession: true,
        });

        Mixpanel.track('stopSession');

        SessionControlService.stop(true, err => {
          if (err) {
            // Only unset this state on errors.
            // This is because on a succesful stop attempt,
            // the scene could already be unmounted at this phase
            this.setState({ hasPendingSessionOperation: false });

            this.props.dispatch(appActions.showPartialModal({
              title: {
                caption: 'Error',
                color: theme.warningColor,
              },
              detail: { caption: 'An error occurred while attempting to stop the session.' },
              buttons: [
                {
                  caption: 'Leave',
                  onPress: () => {
                    this.props.dispatch(appActions.hidePartialModal());
                    this.props.navigator.pop();
                  },
                },
                {
                  caption: 'Retry',
                  onPress: () => {
                    this.props.dispatch(appActions.hidePartialModal());
                    this.stopSession();
                  },
                },
              ],
              backButtonHandler: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            }));

            Mixpanel.trackError({
              errorContent: err,
              path: 'app/components/posture/PostureMonitor',
              stackTrace: ['stopSession', 'SessionControlService.stop'],
            });
          }
        });
      }
    }
  }

  confirmStopSession() {
    this.props.dispatch(appActions.showPartialModal({
      topView: (
        <Image source={deviceWarningIcon} />
      ),
      title: {
        caption: 'Stop Session?',
      },
      detail: {
        caption: 'Are you sure you want to stop your current session?',
      },
      buttons: [
        {
          caption: 'STOP',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
            this.stopSession();
          },
        },
        {
          caption: 'RESUME',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        },
      ],
      backButtonHandler: () => {
        this.props.dispatch(appActions.hidePartialModal());
      },
    }));
  }

  /**
   * Updates a user's last session date and updates their daily streak as needed
   */
  saveUserSession() {
    const { user: { _id, dailyStreak, lastSession }, dispatch } = this.props;
    const today = new Date();
    const updateUserPayload = { _id, lastSession: today };

    if (lastSession) {
      const userLastSession = new Date(lastSession);
      const cloneLastSession = new Date(lastSession);
      cloneLastSession.setDate(userLastSession.getDate() + 1);

      if (today.toDateString() === cloneLastSession.toDateString()) {
        // Session date is next day from the last session
        updateUserPayload.dailyStreak = dailyStreak + 1;
      } else if (today.toDateString() === userLastSession.toDateString()) {
        // Session date is same as last session, do not increment streak
      } else {
        // Reset streak
        updateUserPayload.dailyStreak = 1;
      }
    } else {
      // First-time user
      updateUserPayload.dailyStreak = 1;
    }

    // If daily streak needs to be updated, track the change in Mixpanel
    if (updateUserPayload.dailyStreak && dailyStreak !== updateUserPayload.dailyStreak) {
      this.trackDailyStreak(updateUserPayload.dailyStreak, dailyStreak);
    }

    dispatch(userActions.updateUser(updateUserPayload));
  }

  /**
   * Tracks a user's posture session on Mixpanel
   */
  trackUserSession() {
    const sessionTime = this.props.posture.sessionTimeSeconds;
    const { slouchTime, totalDuration } = this.state;

    SessionControlService.getSessionDetails(details => {
      Mixpanel.trackWithProperties('postureSession', {
        sessionId: details.id,
        sessionTime,
        totalDuration,
        slouchTime,
        completedSession: sessionTime === 0 || totalDuration === sessionTime,
      });
    });
  }

  /**
   * Tracks a user's dailyStreak on Mixpanel
   */
  trackDailyStreak(current, previous) {
    Mixpanel.trackWithProperties('dailyStreak', {
      // If we see that a user is no longer on a streak, we can look at the
      // current and previous streak properties and see where the drop off is
      activeStreak: current >= previous,
      current,
      previous,
    });
  }

  /**
   * Marks the current posture sesson as completed
   */
  markPostureSessionCompleted() {
    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx,
    } = this.props.training;
    let progress = this.props.user.trainingPlanProgress;
    progress = markSessionStepComplete(plans, selectedPlanIdx, selectedLevelIdx,
      selectedSessionIdx, selectedStepIdx, progress);
    this.props.dispatch(userActions.updateUserTrainingPlanProgress(progress));
  }

  /**
   * Displays a modal containing the session summary
   */
  showSummary() {
    const { sessionDuration, slouchTime, totalDuration } = this.state;
    const { backboneVibration } = this.props.user.settings;
    const { isGuidedTraining } = this.props.posture;

    // For timed session, mark the workout as 'completed' only if the entire duration is completed
    if (isGuidedTraining && sessionDuration * 60 === totalDuration) {
      this.markPostureSessionCompleted();
    }

    // Track session in Mixpanel
    this.trackUserSession();

    // Save session summary in data warehouse
    SessionControlService.saveSessionToFirehose(() => {
      SessionControlService.submitFirehoseRecords();
    });

    const goodPostureTime = totalDuration - slouchTime;
    const goal = sessionDuration;
    const goodPostureHours = Math.floor(goodPostureTime / 3600);
    const goodPostureMinutes = Math.floor((goodPostureTime - (goodPostureHours * 3600)) / 60);
    const goodPostureSeconds = goodPostureTime % 60;

    const gradePercentage = goodPostureTime / (goal > 0 ? goal * 60 : totalDuration);
    const awesomeGrade = gradePercentage >= 0.9;
    let grade;

    if (gradePercentage >= 1.0) {
      grade = 'A+';
    } else if (gradePercentage >= 0.93) {
      grade = 'A';
    } else if (gradePercentage >= 0.9) {
      grade = 'A-';
    } else if (gradePercentage >= 0.87) {
      grade = 'B+';
    } else if (gradePercentage >= 0.83) {
      grade = 'B';
    } else if (gradePercentage >= 0.8) {
      grade = 'B-';
    } else if (gradePercentage >= 0.77) {
      grade = 'C+';
    } else if (gradePercentage >= 0.73) {
      grade = 'C';
    } else if (gradePercentage >= 0.7) {
      grade = 'C-';
    } else if (gradePercentage >= 0.67) {
      grade = 'D+';
    } else if (gradePercentage >= 0.63) {
      grade = 'D';
    } else if (gradePercentage >= 0.6) {
      grade = 'D-';
    } else {
      grade = 'F';
    }

    const goodPostureTimeStringArray = ['', '00:', `${zeroPadding(goodPostureSeconds)}`];
    if (goodPostureHours) {
      goodPostureTimeStringArray[0] = `${goodPostureHours}:`;
    }
    if (goodPostureMinutes) {
      goodPostureTimeStringArray[1] = `${goodPostureMinutes}:`;
    }
    const goodPostureTimeString = goodPostureTimeStringArray.join('');

    const closeSummaryAndPop = () => {
      this.props.dispatch(appActions.hidePartialModal());
      this.props.navigator.pop();

      const {
        plans,
        selectedPlanIdx,
        selectedLevelIdx,
        selectedSessionIdx,
        selectedStepIdx,
      } = this.props.training;
      let progress = this.props.user.trainingPlanProgress;
      progress = markSessionStepComplete(plans, selectedPlanIdx, selectedLevelIdx,
        selectedSessionIdx, selectedStepIdx, progress);

      const currentPlan = plans[selectedPlanIdx];
      if (isTrainingPlanComplete(currentPlan.levels, progress[currentPlan._id])) {
        // Training is complete, show congratulatory message
        setTimeout(() => {
          this.props.dispatch(appActions.showPartialModal({
            topView: <MaterialIcon name="star" style={styles.planCompletedStarIcon} />,
            title: {
              caption: 'Congratulations!',
              color: theme.green400,
            },
            detail: {
              caption: [
                'You\'ve completed the ',
                currentPlan.name || '',
                ' training program. Stay tuned for additional training programs.',
              ].join(''),
            },
            buttons: [{ caption: 'OK' }],
            backButtonHandler: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          }));
        }, 500);
      }
    };

    this.props.dispatch(appActions.showPartialModal({
      topView: (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryTopIcon}>
            <FontAwesomeIcon name={'circle'} style={styles.summaryTopStarCircle} />
            <FontAwesomeIcon name={'star'} style={styles.summaryTopStar} />
          </View>
          { awesomeGrade ?
            <BodyText style={styles.summaryTitle}>
              Awesome!
            </BodyText>
              : <View style={styles.emptyTitle} />
          }
          <View style={styles.summaryDetailContainer}>
            <View style={styles.summaryDetailRow}>
              <View style={styles.summaryDetailIconContainer}>
                <FontAwesomeIcon name={'bullseye'} style={styles.summaryDetailIconGoal} />
              </View>
              <View style={styles.summaryDetailCaptionContainer}>
                <BodyText>Goal:</BodyText>
              </View>
              <View style={styles.summaryDetailValueContainer}>
                <BodyText style={styles._summaryDetailValue}>
                  {goal > 0 ? `${goal}:00` : '-'}
                </BodyText>
              </View>
            </View>
            <View style={styles.summaryDetailLine} />
            <View style={styles.summaryDetailRow}>
              <View style={styles.summaryDetailIconContainer}>
                <Image source={vertebraeIcon} style={styles.summaryDetailIconVertebrae} />
              </View>
              <View style={styles.summaryDetailCaptionContainer}>
                <BodyText>Perfect Posture:</BodyText>
              </View>
              <View style={styles.summaryDetailValueContainer}>
                <BodyText style={styles._summaryDetailValue}>{goodPostureTimeString}</BodyText>
              </View>
            </View>
            <View style={styles.summaryDetailLine} />
            <View style={styles.summaryDetailRow}>
              <View style={styles.summaryDetailIconContainer}>
                <FontAwesomeIcon name={'star'} style={styles.summaryDetailIconStar} />
              </View>
              <View style={styles.summaryDetailCaptionContainer}>
                <BodyText>Grade:</BodyText>
              </View>
              <View style={styles.summaryDetailValueContainer}>
                <BodyText style={styles._summaryDetailValue}>{grade}</BodyText>
              </View>
            </View>
          </View>
        </View>
      ),
      detail: {
        caption: '',
      },
      buttons: [
        {
          caption: 'DONE',
          onPress: closeSummaryAndPop,
          color: theme.lightBlue500,
          underlayColor: color(theme.lightBlue500).clearer(0.5).rgbString(),
        },
      ],
      backButtonHandler: closeSummaryAndPop,
      customStyles: {
        topViewStyle: styles.summaryTopView,
      },
    }));

    // Clear the slouch notification when the current session has ended
    NotificationService.clearNotification(notificationTypes.SLOUCH_WARNING);

    // Vibrate the motor to indicate the current session has ended
    // only if it ends naturally without forcing it to stop
    if (!this.state.forceStoppedSession && backboneVibration) {
      // Vibrate 3 times with gradually increased durations
      VibrationMotorService.vibrate([
        { vibrationSpeed: this.state.vibrationSpeed, vibrationDuration: vibrationDurations.SHORT },
        { vibrationSpeed: this.state.vibrationSpeed, vibrationDuration: vibrationDurations.SHORT },
        { vibrationSpeed: this.state.vibrationSpeed, vibrationDuration: vibrationDurations.MEDIUM },
      ]);
    }

    if (AppState.currentState === 'background') {
      // Notify the user that the current session has ended
      // only when the app is in the background
      NotificationService.sendNotification(notificationTypes.SESSION_COMPLETED,
        'Congratulations!',
        'You have just finished a posture session! See how you did.');
    }

    if (!isiOS) {
      // Pop scene so if the Android back button is pressed while the modal
      // is displayed, it won't navigate back to PostureMonitor
      this.props.navigator.pop();
    }
  }

  /**
   * Updates the posture threshold value in the component state, and as a result,
   * updates the visual monitor to indicate the good/bad range
   * @param {Number} distance The distance away from the control point at which the user
   *                          is considered slouching
   */
  updatePostureThreshold(distance) {
    this.setState({
      postureThreshold: distance,
      slouchDistanceThreshold: Math.floor(numberMagnitude(distance, 4)),
    }, () => {
      this.updateUserPostureThreshold(distance);
    });
  }

  /**
   * Updates the user's posture threshold setting in their profile
   * @param {Number} distance The distance away from the control point at which the user
   *                          is considered slouching
   */
  updateUserPostureThreshold(distance) {
    const updatedUserSettings = {
      ...this.props.user,
      settings: {
        ...this.props.user.settings,
        postureThreshold: distance,
      },
    };
    this.props.dispatch(userActions.updateUserSettings(updatedUserSettings));
  }

  navigateToAlert() {
    return this.props.navigator.push(routes.alerts);
  }

  navigateToRecalibrate() {
    this.props.dispatch(appActions.showPartialModal({
      topView: (
        <Image source={deviceWarningIcon} />
      ),
      title: {
        caption: 'Stop Session?',
      },
      detail: {
        caption: 'Are you sure you want to stop your current session?',
      },
      buttons: [
        {
          caption: 'STOP',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
            this.stopSession();
            this.props.navigator.resetTo(routes.postureCalibrate);
          },
        },
        {
          caption: 'RESUME',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        },
      ],
      backButtonHandler: () => {
        this.props.dispatch(appActions.hidePartialModal());
      },
    }));
  }

  render() {
    const {
      postureThreshold,
      pointerPosition,
      sessionState,
      hasPendingSessionOperation,
      currentDistance,
    } = this.state;

    const isDisabled = sessionState === sessionStates.RUNNING;
    const totalSessionTime = this.props.posture.sessionTimeSeconds;

    const getPlayPauseButton = () => {
      if (sessionState === sessionStates.STOPPED) {
        return (
          <MonitorButton
            text="PLAY"
            icon="play-arrow"
            onPress={this.startSession}
          />
        );
      } else if (isDisabled) {
        return (
          <MonitorButton
            text="PAUSE"
            icon="pause"
            onPress={this.pauseSession}
          />
        );
      }
      return (
        <MonitorButton
          text="PLAY"
          icon="play-arrow"
          onPress={this.resumeSession}
        />
      );
    };

    return this.props.device.isConnecting ? (
      <View style={styles.connectingContainer}>
        <Spinner style={styles.connectingSpinner} />
        <HeadingText size={2} style={styles.connectingText}>Connecting...</HeadingText>
      </View>
    ) : (
      <View style={styles.container}>
        <View>
          <BodyText style={styles.timer}>
            {this.getFormattedTime()}
          </BodyText>
          {
            (totalSessionTime !== 0) ?
              <BodyText style={styles.heading}>Time Remaining</BodyText> : null
          }
        </View>
        <Monitor
          disable={isDisabled}
          pointerPosition={pointerPosition}
          slouchPosition={getSlouchPosition(postureThreshold)}
          onPress={this.navigateToRecalibrate}
          rating={(currentDistance < postureThreshold)}
        />

        {/*
          The allowed range for the posture distance threshold is MIN_POSTURE_THRESHOLD
          to MAX_POSTURE_THRESHOLD. Ideally, the minimumValue and maximumValue for the
          slider component below should be -MAX_POSTURE_THRESHOLD and -MIN_POSTURE_THRESHOLD,
          respectively, but such a combination does not work on Android. As a result,
          minimumValue and maximumValue are shifted by the difference between 0 and the
          MIN_POSTURE_THRESHOLD to make maximumValue equal to 0 in order for the slider to
          work on both Android and iOS.
        */}
        <View>
          <MonitorSlider
            value={-postureThreshold + MIN_POSTURE_THRESHOLD}
            onValueChange={value => {
              const correctedValue = value - MIN_POSTURE_THRESHOLD;
            // The value is rounded to 3 decimals places to prevent unexpected rounding issues
              this.updatePostureThreshold(-correctedValue.toFixed(3));
            }}
            minimumValue={MIN_POSTURE_THRESHOLD - MAX_POSTURE_THRESHOLD}
            maximumValue={0}
            disabled={isDisabled}
          />
          <SecondaryText style={styles.sliderTitle}>SLOUCH DETECTION</SecondaryText>
        </View>
        <View style={styles.btnContainer}>
          {getPlayPauseButton()}
          {sessionState !== sessionStates.PAUSED || hasPendingSessionOperation ?
            <MonitorButton
              disabled
              icon="notifications"
              text="ALERTS"
            /> :
              <MonitorButton
                icon="notifications"
                text="ALERTS"
                onPress={this.navigateToAlert}
              />
          }
          <MonitorButton
            text="STOP"
            icon="stop"
            onPress={this.confirmStopSession}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { app, device, posture, user: { user }, training } = state;
  return { app, device, posture, user, training };
};

export default connect(mapStateToProps)(PostureMonitor);
