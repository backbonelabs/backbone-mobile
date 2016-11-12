import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Vibration,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import { isFunction } from 'lodash';
import postureActions from '../../actions/posture';
import styles from '../../styles/posture/postureMonitor';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import SecondaryText from '../../components/SecondaryText';
import MonitorButton from './postureMonitor/MonitorButton';
import Monitor from './postureMonitor/Monitor';
import MonitorSlider from './postureMonitor/MonitorSlider';

const { ActivityService } = NativeModules;
const activityName = 'posture';

class PostureMonitor extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    posture: PropTypes.shape({
      sessionTimeSeconds: PropTypes.number,
      remainingTimeSeconds: PropTypes.number,
    }),
    user: PropTypes.shape({
      settings: PropTypes.shape({
        phoneVibration: PropTypes.bool,
        postureThreshold: PropTypes.number,
        slouchTimeThreshold: PropTypes.number,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      monitoring: null,
      slouch: 0,
      level: 90,
    };
    this.intervalId = null;
    this.postureListener = null;
    this.activityDisabledListener = null;
    this.enablePostureActivity = this.enablePostureActivity.bind(this);
    this.disablePostureActivity = this.disablePostureActivity.bind(this);
  }

  componentWillMount() {
    this.enablePostureActivity();

    // Register listener for when the posture activity is disabled
    this.activityDisabledListener = NativeAppEventEmitter.addListener('ActivityDisabled', event => {
      if (event.module === activityName) {
        this.setState({ monitoring: false }, () => {
          // Remove the posture event listener
          if (this.postureListener && isFunction(this.postureListener.remove)) {
            this.postureListener.remove();
          }
        });
      }
    });
  }

  componentDidMount() {
    // Set up an interval timer to decrease the duration every second
    if (this.props.posture.sessionTimeSeconds < Infinity) {
      this.intervalId = setInterval(() => {
        this.props.dispatch(postureActions.decreaseSessionTime());
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.disablePostureActivity();
    if (this.activityDisabledListener && isFunction(this.activityDisabledListener.remove)) {
      this.activityDisabledListener.remove();
    }
  }

  getFormattedTimeRemaining() {
    const secondsRemaining = this.props.posture.remainingTimeSeconds;
    console.log('getFormattedTimeRemaining', secondsRemaining);
    if (secondsRemaining <= 0) {
      // In case the scene is still mounted after the session is finished,
      // display no time remaining instead of a negative time
      return '0:00';
    }

    // TODO: Show incrementing stopwatch if the unlimited session was chosen

    const minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining - (minutes * 60);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  }

  enablePostureActivity() {
    ActivityService.enableActivity(activityName, (error) => {
      if (!error) {
        this.setState({ monitoring: true }, () => {
          const { settings } = this.props.user;
          // Attach listener
          this.postureListener = NativeAppEventEmitter.addListener('PostureDistance', (event) => {
            const { currentDistance, slouchTime } = event;

            // User is slouching if currentDistance is greater than or equal to threshold
            const isSlouching = (currentDistance >= settings.postureThreshold);

            // Check if user slouch time is over slouch time threshold
            const isOverSlouchTimeThreshold = (slouchTime >= settings.slouchTimeThreshold);
            // If user is slouching and phone vibration is set to true, then vibrate phone
            if (isSlouching && settings.phoneVibration && isOverSlouchTimeThreshold) {
              /**
               * Next PR will include toggling on/off vibration settings and fetching user settings
               * without the user having to go to the settings route (which is how it currently is)
               */
              Vibration.vibrate();
            } else if (isSlouching && !settings.phoneVibration) {
              // We may still want to do something here, even if phoneVibration isn't true
            }
          });
        });
      } else {
        // TODO: Send to Error component (tbd)
        Alert.alert('Error', error.message);
      }
    });
  }

  disablePostureActivity() {
    ActivityService.disableActivity(activityName);
  }

  render() {
    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._timer}>
          {this.getFormattedTimeRemaining()}
        </HeadingText>
        <HeadingText size={3} style={styles._heading}>SESSION TIME</HeadingText>
        <Monitor />
        <View style={styles.monitorRatingContainer}>
          <BodyText style={styles._monitorPoor}>Poor</BodyText>
          <BodyText style={styles._monitorGood}>Good</BodyText>
        </View>
        <BodyText style={styles._monitorTitle}>POSTURE MONITOR</BodyText>
        <SecondaryText style={styles._sliderTitle}>
          Tune up or down the Backbone's slouch detection
        </SecondaryText>
        <MonitorSlider onValueChange={(value) => this.setState({ slouch: value })} />
        <View style={styles.btnContainer}>
          { this.state.monitoring ? <MonitorButton pause onPress={this.enablePostureActivity} /> :
            <MonitorButton play onPress={this.enablePostureActivity} />
          }
          <MonitorButton alertsDisabled />
          <MonitorButton stop onPress={this.disablePostureActivity} />
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
