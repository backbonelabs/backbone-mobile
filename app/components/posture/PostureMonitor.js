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
    user: PropTypes.object,
    settings: PropTypes.shape({
      phoneVibration: PropTypes.bool,
      postureThreshold: PropTypes.number,
    }),
  };

  constructor(props) {
    super(props);
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
            // Find absolute value of difference between controlDistance and currentDistance
            const absoluteDistance = Math.abs(event.controlDistance - event.currentDistance);

            // User is slouching if absoluteDistance is greater than or equal to threshold
            const isSlouching = (absoluteDistance >= settings.postureThreshold);

            // If user is slouching and phone vibration is set to true, then vibrate phone
            if (isSlouching && settings.phoneVibration) {
              /**
               * Next PR will include toggling on/off vibration settings and fetching user settings
               * without the user having to go to the settings route (which is how it currently is)
               */
              Vibration.vibrate();
            } else if (isSlouching && !this.state.settings.phoneVibration) {
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
    ActivityService.disableActivity(activityName, () =>
      this.setState({ monitoring: false }, () => {
        if (isFunction(this.postureListener.remove)) {
          this.postureListener.remove();
        }
      })
    );
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

const mapStateToProps = state => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(PostureMonitor);

