import React, { Component } from 'react';
import {
  View,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
// import Monitor from './Monitor';
// import Calibrate from './Calibrate';
import PostureTutorial from './PostureTutorial';
import styles from '../styles/posture';

const { ActivityService } = NativeModules;

// TODO: Refactor into a shared constants export that tracks all the activity names
const postureActivity = 'posture';

export default class Posture extends Component {
  static propTypes = {
    currentRoute: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      tilt: 0,
      tiltDirection: 'forward',
      calibrating: false,
      monitoring: false,
    };

    this.startPostureMonitoring = this.startPostureMonitoring.bind(this);
    this.stopPostureMonitoring = this.stopPostureMonitoring.bind(this);
    this.beginCalibrate = this.beginCalibrate.bind(this);
    this.listenToTilt = null;
  }

  componentWillMount() {
    const context = this;
    this.listenToTilt = NativeAppEventEmitter.addListener(
      'PostureTilt', (event) => {
        let tiltDirection = 'forward';
        if (event.tilt < 0) {
          tiltDirection = 'backward';
        }
        context.setState({
          tiltDirection,
          tilt: Math.abs(event.tilt),
        });
      }
    );
  }

  componentWillUnmount() {
    this.listenToTilt.remove();
  }

  startPostureMonitoring() {
    ActivityService.enableActivity(postureActivity, err => {
      if (err) {
        // TODO: Add error handling
      } else {
        this.setState({
          calibrating: false,
          monitoring: true,
        });
      }
    });
  }

  stopPostureMonitoring() {
    ActivityService.disableActivity(postureActivity);

    this.setState({
      tilt: 0,
      monitoring: false,
    });
  }

  beginCalibrate() {
    this.setState({
      calibrating: true,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <PostureTutorial />
        </View>
{/*        {this.state.calibrating ?
          <Calibrate startPostureMonitoring={this.startPostureMonitoring} /> :
          <Monitor
            tilt={this.state.tilt}
            tiltDirection={this.state.tiltDirection}
            start={this.startPostureMonitoring}
            stop={this.stopPostureMonitoring}
            beginCalibrate={this.beginCalibrate}
            monitoring={this.state.monitoring}
            currentRoute={this.props.currentRoute}
          />
        }*/}
      </View>
		);
  }
}
