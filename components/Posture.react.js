import React, { Component } from 'react';
import Monitor from './Monitor.react';
import Calibrate from './Calibrate.react';

import {
  View,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const MetaWearAPI = NativeModules.MetaWearAPI;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class Posture extends Component {
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

    this.listenToTilt = new NativeEventEmitter(NativeModules.MetaWearAPI);

    this.listenToTilt.addListener('Tilt', (event) => {
      let tiltDirection = 'forward';
      if (event < 0) {
        tiltDirection = 'backward';
      }
      context.setState({
        tiltDirection,
        tilt: Math.abs(event),
      });
    });
  }

  componentWillUnmount() {
    this.listenToTilt.remove();
  }

  startPostureMonitoring() {
    MetaWearAPI.startPostureMonitoring();

    this.setState({
      calibrating: false,
      monitoring: true,
    });
  }

  stopPostureMonitoring() {
    MetaWearAPI.stopPostureMonitoring();

    this.setState({
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
        {this.state.calibrating ?
          <Calibrate startPostureMonitoring={this.startPostureMonitoring} /> :
          <Monitor
            tilt={this.state.tilt}
            tiltDirection={this.state.tiltDirection}
            start={this.startPostureMonitoring}
            stop={this.stopPostureMonitoring}
            beginCalibrate={this.beginCalibrate}
            monitoring={this.state.monitoring}
          />
        }
      </View>
		);
  }
}

export default Posture;
