import React, { Component, PropTypes } from 'react';
import {
  View,
  // Vibration,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import styles from '../../styles/posture/postureMonitor';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import SecondaryText from '../../components/SecondaryText';
import MonitorButton from './postureMonitor/MonitorButton';
import Monitor from './postureMonitor/Monitor';
import MonitorSlider from './postureMonitor/MonitorSlider';
import appActions from '../../actions/app';
import routes from '../../routes';
import PostureSummary from './PostureSummary';

const { SessionControlService } = NativeModules;
const eventEmitter = new NativeEventEmitter(SessionControlService);

/**
 * Maps distance values to slouch degrees for determining how much to rotate
 * the monitor pointer. The degree output would range from -180 to 0, where -180
 * would have the pointer pointing horizontally left and 0 would have the pointer
 * pointing horizontally right.
 * @param  {Number} distance Deviation from the control point
 * @return {Number}          Degree equivalent of the distance value
 */
const distanceToDegrees = distance => {
  const minDistance = 0;
  const maxDistance = 0.3; // This is the max distance we care for
  const minMappedDegree = 0;
  const maxMappedDegree = -180;
  const numerator = (distance - minDistance) * (maxMappedDegree - minMappedDegree);
  const denominator = maxDistance - minDistance;
  return Math.max(-180, (numerator / denominator) + minMappedDegree);
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
    }),
  };

  constructor() {
    super();
    this.state = {
      monitoring: false,
      slouchDeg: -90,
      handDeg: 0,
    };
    this.postureListener = null;
    this.activityDisabledListener = null;
    this.distanceHandler = this.distanceHandler.bind(this);
    this.startSession = this.startSession.bind(this);
    this.pauseSession = this.pauseSession.bind(this);
    this.stopSession = this.stopSession.bind(this);
    this.showSummary = this.showSummary.bind(this);
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
    this.stopSession();

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

  distanceHandler(event) {
    const { currentDistance } = event;

    /*
    The following was carried over from before for reference. It will need some cleaning up.

    ==================================================

    const { currentDistance, slouchTime } = event;

    // User is slouching if currentDistance is greater than or equal to threshold
    const isSlouching = (currentDistance >= settings.postureThreshold);

    // Check if user slouch time is over slouch time threshold
    const isOverSlouchTimeThreshold = (slouchTime >= settings.slouchTimeThreshold);
    // If user is slouching and phone vibration is set to true, then vibrate phone
    if (isSlouching && settings.phoneVibration && isOverSlouchTimeThreshold) {
      Vibration.vibrate();
    } else if (isSlouching && !settings.phoneVibration) {
      // We may still want to do something here, even if phoneVibration isn't true
    }

    ==================================================
     */

    // Calculate and update the number of degrees to rotate the pointer
    this.setState({ handDeg: distanceToDegrees(currentDistance) });
  }

  startSession() {
    SessionControlService.start(err => {
      if (err) {
        // TODO: Implement error handling
        console.log('error', err);
      } else {
        console.log('no error', err);
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
        this.setState({ monitoring: false });
      }
    });
  }

  showSummary() {
    const sessionTime = this.props.posture.sessionTimeSeconds;
    let minutes = Math.floor(sessionTime / 60);
    if (sessionTime === Infinity) {
      minutes = 0;
    }
    this.props.dispatch(appActions.showFullModal({
      onClose: () => this.props.navigator.resetTo(routes.postureDashboard),
      content: <PostureSummary time="04:30" goal={minutes} />,
    }));
  }

  render() {
    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._timer}>
          {this.getFormattedTimeRemaining()}
        </HeadingText>
        <HeadingText size={3} style={styles._heading}>SESSION TIME</HeadingText>
        <Monitor degree={this.state.handDeg} slouchDetection={this.state.slouchDeg} />
        <View style={styles.monitorRatingContainer}>
          <BodyText style={styles._monitorPoor}>Poor</BodyText>
          <BodyText style={styles._monitorGood}>Good</BodyText>
        </View>
        <BodyText style={styles._monitorTitle}>POSTURE MONITOR</BodyText>
        <SecondaryText style={styles._sliderTitle}>
          Tune up or down the Backbone's slouch detection
        </SecondaryText>
        <MonitorSlider
          value={this.state.slouchDeg}
          onValueChange={(value) => this.setState({ slouchDeg: value })}
          minimumValue={-180}
          maximumValue={0}
          disabled={this.state.monitoring}
        />
        <View style={styles.btnContainer}>
          { this.state.monitoring ? <MonitorButton pause onPress={this.pauseSession} /> :
            <MonitorButton play onPress={this.startSession} />
          }
          <MonitorButton alertsDisabled onPress={this.showSummary} />
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
