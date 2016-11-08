import React, { Component, PropTypes } from 'react';
import {
  View,
  // Alert,
  Vibration,
  NativeModules,
  NativeAppEventEmitter,
  Slider,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { isFunction } from 'lodash';
import styles from '../../styles/posture/postureMonitor';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import SecondaryText from '../../components/SecondaryText';
import MonitorButton from './postureMonitor/MonitorButton';
import Monitor from './postureMonitor/Monitor';

const { ActivityService } = NativeModules;
const activityName = 'posture';

class PostureMonitor extends Component {
  static propTypes = {
    user: PropTypes.shape({
      settings: PropTypes.object,
    }),
    settings: PropTypes.shape({
      phoneVibration: PropTypes.bool,
      postureThreshold: PropTypes.number,
      slouchTimeThreshold: PropTypes.number,
    }),
  };

  constructor() {
    super();
    this.state = {
      monitoring: null,
      slouch: 0,
      level: 90,
    };
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

  componentWillUnmount() {
    this.disablePostureActivity();
    if (this.activityDisabledListener && isFunction(this.activityDisabledListener.remove)) {
      this.activityDisabledListener.remove();
    }
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
        // Alert.alert('Error', error.message);
      }
    });
  }

  disablePostureActivity() {
    ActivityService.disableActivity(activityName);
  }

  render() {
    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._timer}>05:00</HeadingText>
        <BodyText style={styles._heading}>SESSION TIME</BodyText>
        <Monitor level={this.state.level} />
        <View style={styles.monitorRatingContainer}>
          <BodyText style={styles._monitorPoor}>Poor</BodyText>
          <BodyText style={styles._monitorGood}>Good</BodyText>
        </View>
        <BodyText style={styles._monitorTitle}>POSTURE MONITOR</BodyText>
        <SecondaryText style={styles._sliderTitle}>
          Tune up or down the Backbone's slouching detection
        </SecondaryText>
        <View style={styles.sliderContainer}>
          <Icon name="minus" style={{ top: 14 }} />
          <View style={{ flex: 1 }}>
            <Slider
              minimumTrackTintColor={'#ED1C24'}
              minimumValue={0.1}
              maximumValue={1}
              onValueChange={(value) => this.setState({ slouch: value })}
            />
          </View>
          <Icon name="plus" style={{ top: 14 }} />
        </View>
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
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(PostureMonitor);
