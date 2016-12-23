import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Vibration,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import autobind from 'autobind-decorator';
import { debounce } from 'lodash';
import styles from '../../styles/posture/postureMonitor';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import SecondaryText from '../../components/SecondaryText';
import MonitorButton from './postureMonitor/MonitorButton';
import Monitor from './postureMonitor/Monitor';
import MonitorSlider from './postureMonitor/MonitorSlider';
import appActions from '../../actions/app';
import userActions from '../../actions/user';
import PostureSummary from './PostureSummary';
import routes from '../../routes';

const { SessionControlService, Mixpanel } = NativeModules;
const eventEmitter = new NativeEventEmitter(SessionControlService);

const MIN_POSTURE_THRESHOLD = 0.03;
const MAX_POSTURE_THRESHOLD = 0.3;

/**
 * Maps distance values to slouch degrees for determining how much to rotate
 * the monitor pointer. The degree output would range from -180 to 0, where -180
 * would have the pointer pointing horizontally left and 0 would have the pointer
 * pointing horizontally right. The max distance range is MAX_POSTURE_THRESHOLD.
 * @param  {Number} distance Deviation from the control point
 * @return {Number}          Degree equivalent of the distance value
 */
const distanceToDegrees = distance => {
  const maxMappedDegree = -180;
  return Math.max(-180, (distance / MAX_POSTURE_THRESHOLD) * maxMappedDegree);
};

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
    posture: PropTypes.shape({
      sessionTimeSeconds: PropTypes.number.isRequired,
    }),
    user: PropTypes.shape({
      settings: PropTypes.shape({
        phoneVibration: PropTypes.bool.isRequired,
        postureThreshold: PropTypes.number.isRequired,
        vibrationStrength: PropTypes.number.isRequired,
        vibrationPattern: PropTypes.oneOf([1, 2, 3]).isRequired,
      }).isRequired,
      _id: PropTypes.string.isRequired,
      dailyStreak: PropTypes.number.isRequired,
      lastSession: PropTypes.string,
    }),
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      push: PropTypes.func,
      pop: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      sessionState: sessionStates.STOPPED,
      postureThreshold: this.props.user.settings.postureThreshold,
      pointerPosition: 0,
      totalDuration: 0, // in seconds
      slouchTime: 0, // in seconds
    };
    this.postureListener = null;
    this.slouchListener = null;
    this.statsListener = null;
    // Debounce update of user posture threshold setting to limit the number of API requests
    this.updateUserPostureThreshold = debounce(this.updateUserPostureThreshold, 1000);
  }

  componentWillMount() {
    // Set up listener for posture distance data
    this.postureListener = eventEmitter.addListener('PostureDistance', this.distanceHandler);

    // Set up listener for slouch event
    this.slouchListener = eventEmitter.addListener('SlouchStatus', this.slouchHandler);

    // Set up listener for session statistics event
    this.statsListener = eventEmitter.addListener('SessionStatistics', this.statsHandler);

    // Automatically start the session on mount
    this.startSession();
  }

  componentWillUnmount() {
    // End the session if it's running
    SessionControlService.stop(() => {
      // no-op
    });

    // Remove listeners
    this.postureListener.remove();
    this.slouchListener.remove();
    this.statsListener.remove();
  }

  /**
   * Displays the session time remaining/elapsed in M:SS format. For timed sessions, the time
   * remaining will be displayed. For untimed sessions, the time elapsed will be displayed.
   * @return {String} Time remaining/elapsed in M:SS format
   */
  getFormattedTimeRemaining() {
    // TODO: Update to display correct time remaining for timed sessions and time elapsed for
    // untimed sessions. This can be done after the device is programmed to stream time data.
    // For now, it just displays the chosen session time.
    const secondsRemaining = this.props.posture.sessionTimeSeconds;
    if (secondsRemaining === Infinity) {
      return '-:--';
    }
    const minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining - (minutes * 60);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  }

  /**
   * Updates the pointer based on the distance away from the control point
   * @param {Object} event
   * @param {Number} event.currentDistance How far away the user is from the control point
   */
  @autobind
  distanceHandler(event) {
    const { currentDistance } = event;
    this.setState({ pointerPosition: distanceToDegrees(currentDistance) });
  }

  /**
   * Handles a slouch event.
   *
   * NOTE: THIS IS NOT COMPLETELY IMPLEMENTED AND WILL
   * UNDERGO CHANGES BASED ON HOW WE WANT TO TAILOR THE UX.
   */
  @autobind
  slouchHandler(event) {
    const { isSlouching } = event;
    // TODO: Implement final UX for slouch events
    if (isSlouching && this.props.user.settings.phoneVibration) {
      // User enabled phone vibration alerts
      // Start a single 1-second phone vibration (the 1-second duration only affects Android;
      // the iOS vibration duration is fixed and defined by the system)
      Vibration.vibrate(1000);
    }
  }

  /**
   * Processes session statistics and displays a summary.
   * @param {Object} event
   * @param {Number} event.totalDuration Total elapsed time of the session, in seconds
   * @param {Number} event.slouchTime    Total slouch time, in seconds
   */
  @autobind
  statsHandler(event) {
    const { totalDuration, slouchTime } = event;
    this.saveUserSession();
    this.setState({
      sessionState: sessionStates.STOPPED,
      totalDuration,
      slouchTime,
    }, this.showSummary);
  }

  sessionCommandAlert({
    title = 'Error',
    message,
    leftLabel = 'Cancel',
    leftAction,
    rightLabel = 'OK',
    rightAction,
  }) {
    Alert.alert(
      title,
      message,
      [{
        text: leftLabel,
        onPress: leftAction,
      }, {
        text: rightLabel,
        onPress: rightAction,
      }]
    );
  }

  @autobind
  startSession() {
    SessionControlService.start({
      sessionDuration: Math.floor(this.props.posture.sessionTimeSeconds / 60),
      // We use the postureThreshold from state instead of the user.settings object
      // because the user may modify the threshold and resume the session before the
      // updated threshold value is saved in the database and a response is returned
      // from the API server to refresh the user object in the Redux store.
      // The slouch distance threshold needs to be in ten thousandths of a unit.
      // For example, to set it to 0.2, the input must be 2000.
      // We use Math.floor because sometimes JS will return a double floating point value,
      // which is incompatible with the firmware.
      slouchDistanceThreshold: Math.floor(numberMagnitude(this.state.postureThreshold, 4)),
      vibrationSpeed: this.props.user.settings.vibrationStrength,
      vibrationPattern: this.props.user.settings.vibrationPattern,
    }, err => {
      if (err) {
        const verb = this.state.sessionState === sessionStates.STOPPED ? 'start' : 'resume';
        const message = `An error occurred while attempting to ${verb} the session.`;
        if (this.state.sessionState === sessionStates.STOPPED) {
          // No session has been started, which means the initial autostart failed, so we should
          // just navigate back since there is nothing else the user can do in this scene
          Alert.alert('Error', message);
          this.props.navigator.pop();
        } else {
          // A session was already started, so an error here would be for resuming the session
          this.sessionCommandAlert({
            message,
            rightLabel: 'Retry',
            rightAction: this.startSession,
          });
        }
      } else {
        this.setState({ sessionState: sessionStates.RUNNING });
      }
    });
  }

  @autobind
  pauseSession() {
    SessionControlService.pause(err => {
      if (err) {
        this.sessionCommandAlert({
          message: 'An error occurred while attempting to pause the session.',
          rightLabel: 'Retry',
          rightAction: this.pauseSession,
        });
      } else {
        this.setState({ sessionState: sessionStates.PAUSED });
      }
    });
  }

  @autobind
  stopSession() {
    // TODO: Decide how we want to allow the user to leave the scene if the stop operation fails
    if (this.state.sessionState === sessionStates.STOPPED) {
      // There is no active session
      this.sessionCommandAlert({
        title: 'Exit',
        message: 'Are you sure you want to leave?',
        rightAction: () => {
          this.trackUserSession(false);
          this.props.navigator.pop();
        },
      });
    } else {
      SessionControlService.stop(err => {
        if (err) {
          this.sessionCommandAlert({
            message: 'An error occurred while attempting to stop the session.',
            rightLabel: 'Retry',
            rightAction: this.stopSession,
          });
        } else {
          this.saveUserSession();
          this.setState({ sessionState: sessionStates.STOPPED });
        }
      });
    }
  }

  /**
   * Updates a user's last session date and updates their daily streak as needed
   */
  @autobind
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
        this.trackDailyStreak(updateUserPayload.dailyStreak, dailyStreak);
      } else if (today.toDateString() === userLastSession.toDateString()) {
        // Session date is same as last session, do not increment streak
      } else {
        // Reset streak
        updateUserPayload.dailyStreak = 1;
        this.trackDailyStreak(updateUserPayload.dailyStreak, dailyStreak);
      }
    } else {
      // First-time user
      updateUserPayload.dailyStreak = 1;
    }

    dispatch(userActions.updateUser(updateUserPayload));
  }

  /**
   * Tracks a user's posture session on Mixpanel
   */
  @autobind
  trackUserSession(completedSession) {
    const sessionTime = this.props.posture.sessionTimeSeconds;
    const { slouchTime, totalDuration } = this.state;

    Mixpanel.trackWithProperties('postureSession', {
      sessionTime,
      totalDuration,
      slouchTime,
      completedSession,
    });
  }

  /**
   * Tracks a user's dailyStreak on Mixpanel
   */
  @autobind
  trackDailyStreak(current, previous) {
    Mixpanel.trackWithProperties('dailyStreak', {
      // If we see that a user is no longer on a streak, we can look at the
      // current and previous streak properties and see where the drop off is
      streak: current >= previous,
      current,
      previous,
    });
  }

  /**
   * Displays a modal containing the session summary
   */
  @autobind
  showSummary() {
    const sessionTime = this.props.posture.sessionTimeSeconds;
    let goalMinutes = Math.floor(sessionTime / 60);
    if (sessionTime === Infinity) {
      goalMinutes = 0;
    }

    const { slouchTime, totalDuration } = this.state;

    this.trackUserSession(true);
    this.props.dispatch(appActions.showFullModal({
      onClose: () => this.props.navigator.resetTo(routes.postureDashboard),
      content: <PostureSummary goodPostureTime={totalDuration - slouchTime} goal={goalMinutes} />,
    }));
  }

  /**
   * Updates the posture threshold value in the component state, and as a result,
   * updates the visual monitor to indicate the good/bad range
   * @param {Number} distance The distance away from the control point at which the user
   *                          is considered slouching
   */
  @autobind
  updatePostureThreshold(distance) {
    this.setState({ postureThreshold: distance }, () => {
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

  render() {
    const {
      postureThreshold,
      pointerPosition,
      sessionState,
    } = this.state;

    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._timer}>
          {this.getFormattedTimeRemaining()}
        </HeadingText>
        <HeadingText size={3} style={styles._heading}>SESSION TIME</HeadingText>
        <Monitor
          pointerPosition={pointerPosition}
          slouchPosition={distanceToDegrees(postureThreshold)}
        />
        <View style={styles.monitorRatingContainer}>
          <BodyText style={styles._monitorPoor}>Poor</BodyText>
          <BodyText style={styles._monitorGood}>Good</BodyText>
        </View>
        <BodyText style={styles._monitorTitle}>POSTURE MONITOR</BodyText>
        <SecondaryText style={styles._sliderTitle}>
          Tune up or down the Backbone's slouch detection
        </SecondaryText>
        {/*
          The allowed range for the posture distance threshold is MIN_POSTURE_THRESHOLD
          to MAX_POSTURE_THRESHOLD. Ideally, the minimumValue and maximumValue for the
          slider component below should be -MAX_POSTURE_THRESHOLD and -MIN_POSTURE_THRESHOLD,
          respectively, but such a combination does not work on Android. As a result,
          minimumValue and maximumValue are shifted by the difference between 0 and the
          MIN_POSTURE_THRESHOLD to make maximumValue equal to 0 in order for the slider to
          work on both Android and iOS.
        */}
        <MonitorSlider
          value={-postureThreshold + MIN_POSTURE_THRESHOLD}
          onValueChange={value => {
            const correctedValue = value - MIN_POSTURE_THRESHOLD;
            // The value is rounded to 3 decimals places to prevent unexpected rounding issues
            this.updatePostureThreshold(-correctedValue.toFixed(3));
          }}
          minimumValue={MIN_POSTURE_THRESHOLD - MAX_POSTURE_THRESHOLD}
          maximumValue={0}
          disabled={sessionState === sessionStates.RUNNING}
        />
        <View style={styles.btnContainer}>
          {sessionState === sessionStates.RUNNING ?
            <MonitorButton pause onPress={this.pauseSession} /> :
              <MonitorButton play onPress={this.startSession} />
          }
          {sessionState === sessionStates.RUNNING ?
            <MonitorButton alertsDisabled disabled /> :
              <MonitorButton alerts onPress={() => this.props.navigator.push(routes.alerts)} />
          }
          <MonitorButton stop onPress={this.stopSession} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { posture, user: { user } } = state;
  return { posture, user };
};

export default connect(mapStateToProps)(PostureMonitor);
