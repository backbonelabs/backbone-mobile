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

const { ActivityService } = NativeModules;
const activityName = 'posture';

// const counter = 1;

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
      _id: PropTypes.string,
      dailyStreak: PropTypes.array,
    }),
    navigator: PropTypes.shape({
      pop: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      monitoring: false,
      slouchDeg: 320,
      handDeg: -90,
    };
    this.postureListener = null;
    this.activityDisabledListener = null;
    this.enablePostureActivity = this.enablePostureActivity.bind(this);
    this.disablePostureActivity = this.disablePostureActivity.bind(this);
    this.showSummary = this.showSummary.bind(this);
    this.sessionComplete = this.sessionComplete.bind(this);
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

  componentWillUnmount() {
    this.disablePostureActivity();
    if (this.activityDisabledListener && isFunction(this.activityDisabledListener.remove)) {
      this.activityDisabledListener.remove();
    }
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

  enablePostureActivity() {
    ActivityService.enableActivity(activityName, (error) => {
      if (!error) {
        this.setState({ monitoring: true }, () => {
          const { settings } = this.props.user;
          // Attach listener
          this.postureListener = NativeAppEventEmitter.addListener('PostureDistance', (event) => {
            // TODO: Get time remaining/elapsed from so component

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

  sessionComplete() {
    const { user: { _id, dailyStreak }, dispatch } = this.props;

    const lastStreakDate = dailyStreak[dailyStreak.length - 1];
    const updateStreak = [...dailyStreak];

    // Update the user object,
    const updateUser = userActions.updateUser({
      _id,
      dailyStreak: updateStreak,
    });

    // Date for current session
    const today = new Date();
    const session = {};

    // For Testing

    // if (counter === 3) {
    //   counter = 10;
    // } else {
    //   counter++;
    // }
    // session.day = today.getDate() + counter;

    // For Testing

    session.day = today.getDate();
    session.month = today.getMonth() + 1; // months start at 0
    session.year = today.getFullYear();

    // If the date for the current session is the following day
    if (dailyStreak.length === 0) {
      updateStreak.push(session);
      dispatch(updateUser);
    } else if ( // If dailyStreak is empty, add date and updateUser
      session.day === (lastStreakDate.day + 1) &&
      session.month === lastStreakDate.month &&
      session.year === lastStreakDate.year
      ) {
      updateStreak.push(session);
      dispatch(updateUser);
    } else if ( // If last date is the same as current session, don't updateUser
      session.day === lastStreakDate.day &&
      session.month === lastStreakDate.month &&
      session.year === lastStreakDate.year
      ) {
      return this.showSummary();
    } else { // If it's not the same date or the day after, then streak is broken, reset it
      updateStreak.length = 0;
      dispatch(updateUser);
    }

    return this.showSummary();
  }

  showSummary() {
    const sessionTime = this.props.posture.sessionTimeSeconds;
    let minutes = Math.floor(sessionTime / 60);
    if (sessionTime === Infinity) {
      minutes = 0;
    }
    this.props.dispatch(appActions.showFullModal({
      onClose: () => this.props.navigator.pop(),
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
          minimumValue={180}
          maximumValue={360}
          disabled={this.state.monitoring}
        />
        <View style={styles.btnContainer}>
          { this.state.monitoring ? <MonitorButton pause onPress={this.enablePostureActivity} /> :
            <MonitorButton play onPress={this.enablePostureActivity} />
          }
          <MonitorButton alertsDisabled onPress={this.sessionComplete} />
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
