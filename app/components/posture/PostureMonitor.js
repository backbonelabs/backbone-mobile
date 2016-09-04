import React, { Component } from 'react';
import {
  View,
  Alert,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import { get, gte } from 'lodash';
import Button from '../Button';
import styles from '../../styles/posture/postureMonitor';

const { ActivityService } = NativeModules;
const activityName = 'posture';

const { PropTypes } = React;

class PostureMonitor extends Component {
  static propTypes = {
    user: PropTypes.object,
    settings: PropTypes.shape({
      postureThreshold: PropTypes.number,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      settings: get(this.props.user, 'settings', {}),
    };
    this.postureDistance = null;
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
        this.postureDistance = NativeAppEventEmitter.addListener('PostureDistance', (event) => {
          const absoluteDistance = Math.abs(event.controlDistance - event.currentDistance);
          const isSlouching = gte(absoluteDistance, this.state.settings.postureThreshold);

          if (isSlouching) {
            /**
             * Next PR will include toggling on/off vibration settings and fetching user settings
             * without the user having to go to the settings route (which is how it currently is)
             */
          }
        });
      } else {
        // TODO: Show an alert, modal, or send to Error component (tbd)
        Alert.alert('Error', error.message);
      }
    });
  }

  disablePostureActivity() {
    ActivityService.disableActivity(activityName, () => this.postureDistance.remove());
  }

  render() {
    return (
      <View style={styles.container}>
        <Button text="Start" onPress={this.enablePostureActivity} />
        <Button text="Stop" onPress={this.disablePostureActivity} />
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(PostureMonitor);

