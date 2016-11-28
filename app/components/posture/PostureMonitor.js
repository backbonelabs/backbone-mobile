import React, { Component, PropTypes } from 'react';
import {
  View,
  Vibration,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
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
import routes from '../../routes';
import PostureSummary from './PostureSummary';

const { SessionControlService } = NativeModules;
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

class PostureMonitor extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    posture: PropTypes.shape({
      sessionTimeSeconds: PropTypes.number,
    }),
    user: PropTypes.shape({
      settings: PropTypes.shape({
        phoneVibration: PropTypes.bool,
        postureThreshold: PropTypes.number,
        slouchTimeThreshold: PropTypes.number,
      }),
    }),
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      push: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      monitoring: false,
      postureThreshold: this.props.user.settings.postureThreshold,
      pointerPosition: 0,
    };
    this.slouchStartTime = null;
    this.postureListener = null;
    this.activityDisabledListener = null;
    this.distanceHandler = this.distanceHandler.bind(this);
    this.startSession = this.startSession.bind(this);
    this.pauseSession = this.pauseSession.bind(this);
    this.stopSession = this.stopSession.bind(this);
    this.showSummary = this.showSummary.bind(this);
    this.updatePostureThreshold = this.updatePostureThreshold.bind(this);
    // Debounce update of user posture threshold setting to limit the number of API requests
    this.updateUserPostureThreshold = debounce(this.updateUserPostureThreshold, 1000);
    this.distance = 0;
  }

  componentWillMount() {
    // Set up listener for posture distance data
    this.postureListener = eventEmitter.addListener(
      'PostureDistance',
      this.distanceHandler
    );

    // Automatically start the session on mount
    this.startSession();
  }

  componentWillUnmount() {
    // End the session if it's running
    SessionControlService.stop(() => {
      // no-op
    });

    // Remove the listener for posture distance data
    this.postureListener.remove();
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
   * Processes the distance data from the device to update visuals and emit alerts as necessary
   * @param {Object} event
   * @param {Number} event.currentDistance How far away the user is from the control point
   */
  distanceHandler(event) {
    const { currentDistance } = event;
    // Apply a low pass filter to smooth out the change in distance because the accelerometer
    // is very sensitive and can lead to a high amount of noise. Note: the alpha is not concrete
    // and can be changed the more we test.
    // http://blog.thomnichols.org/2011/08/smoothing-sensor-data-with-a-low-pass-filter
    const alpha = 0.15;
    this.distance = this.distance + (alpha * (currentDistance - this.distance));

    // Calculate and update the number of degrees to rotate the pointer
    this.setState({ pointerPosition: distanceToDegrees(this.distance) });

    const { settings: { slouchTimeThreshold, phoneVibration } } = this.props.user;

    // Check if user is slouching past their threshold.
    // We use the postureThreshold from state instead of the user.settings object
    // because the user may modify the threshold and resume the session before the
    // updated threshold value is saved in the database and a response is returned
    // from the API server to refresh the user object in the Redux store.
    const isSlouching = this.distance >= this.state.postureThreshold;

    if (isSlouching) {
      // User is currently slouching
      if (this.slouchStartTime) {
        // User was previously slouching
        // Check if user slouched for more than the slouch time threshold
        const isOverSlouchTimeThreshold =
          Date.now() - this.slouchStartTime >= slouchTimeThreshold * 1000;

        if (isOverSlouchTimeThreshold && phoneVibration) {
          // User slouched for more than the threshold and has phone vibrations enabled
          // Vibrate phone (on Android, vibration will last 1000ms; iOS vibration duration
          // is fixed and defined by the system)
          Vibration.vibrate(1000);

          // Clear start time to queue up a new vibration if needed
          this.slouchStartTime = null;
        }
      } else {
        // User just started slouching, capture start time
        this.slouchStartTime = Date.now();
      }
    }

    if (!isSlouching && this.slouchStartTime) {
      // User stopped slouching, clear start time
      this.slouchStartTime = null;
    }
  }

  startSession() {
    SessionControlService.start(err => {
      if (err) {
        // TODO: Implement error handling
        console.log('error', err);
      } else {
        this.setState({ monitoring: true });
      }
    });
  }

  pauseSession() {
    SessionControlService.pause(err => {
      if (err) {
        // TODO: Implement error handling
        console.log('error', err);
      } else {
        this.setState({ monitoring: false });
      }
    });
  }

  stopSession() {
    SessionControlService.stop(err => {
      if (err) {
        // TODO: Implement error handling
        console.log('error', err);
      } else {
        this.setState({ monitoring: false }, this.showSummary);
      }
    });
  }

  /**
   * Displays a modal containing the session summary
   */
  showSummary() {
    const sessionTime = this.props.posture.sessionTimeSeconds;
    let minutes = Math.floor(sessionTime / 60);
    if (sessionTime === Infinity) {
      minutes = 0;
    }
    this.props.dispatch(appActions.showFullModal({
      onClose: () => this.props.navigator.resetTo(routes.postureDashboard),
      content: <PostureSummary time="04:30" goal={minutes} />, // TODO: Get session time
    }));
  }

  /**
   * Updates the posture threshold value in the component state, and as a result,
   * updates the visual monitor to indicate the good/bad range
   * @param {Number} distance The distance away from the control point at which the user
   *                          is considered slouching
   */
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
      monitoring,
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
          disabled={monitoring}
        />
        <View style={styles.btnContainer}>
          { monitoring ? <MonitorButton pause onPress={this.pauseSession} /> :
            <MonitorButton play onPress={this.startSession} />
          }
          {monitoring ? <MonitorButton alertsDisabled disabled /> :
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
