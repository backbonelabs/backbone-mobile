import React, { Component } from 'react';
import {
  View,
  Alert,
  Vibration,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import { isFunction } from 'lodash';
import Button from '../Button';
import styles from '../../styles/posture/postureMonitor';

const { ActivityService } = NativeModules;
const activityName = 'posture';

const { PropTypes } = React;

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
    };
    this.postureListener = null;
    this.enablePostureActivity = this.enablePostureActivity.bind(this);
    this.disablePostureActivity = this.disablePostureActivity.bind(this);
  }

  componentWillMount() {
    this.enablePostureActivity();
  }

  componentWillUnmount() {
    this.disablePostureActivity();
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
    // Disable activity, set monitoring to false, and remove listener
    ActivityService.disableActivity(activityName, () => (
      this.setState({
        monitoring: false,
      }, () => isFunction(this.postureListener.remove) && this.postureListener.remove())
    ));
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          text="Start"
          onPress={this.enablePostureActivity}
          disabled={this.state.monitoring}
        />
        <Button
          text="Stop"
          onPress={this.disablePostureActivity}
          disabled={!this.state.monitoring}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(PostureMonitor);

