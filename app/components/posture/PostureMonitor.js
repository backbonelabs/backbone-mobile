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
import routes from '../../routes';
import PostureSummary from './PostureSummary';

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
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
    }),
    dispatch: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      monitoring: null,
      slouch: 0,
      degree: -180,
    };
    this.postureListener = null;
    this.activityDisabledListener = null;
    this.enablePostureActivity = this.enablePostureActivity.bind(this);
    this.disablePostureActivity = this.disablePostureActivity.bind(this);
    this.showModal = this.this.showModal.bind(this);
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
        Alert.alert('Error', error.message);
      }
    });
  }

  disablePostureActivity() {
    ActivityService.disableActivity(activityName);
  }

  showModal() {
    this.props.dispatch(appActions.showFullModal({
      onClose: this.props.navigator.resetTo(routes.postureDashboard),
      content: <PostureSummary />,
    }));
  }

  render() {
    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._timer}>05:00</HeadingText>
        <HeadingText size={3} style={styles._heading}>SESSION TIME</HeadingText>
        <Monitor degree={this.state.degree} />
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
          <MonitorButton alertsDisabled onPress={this.showModal} />
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
