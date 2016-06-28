import React, { Component } from 'react';
import Monitor from './Monitor.react';
import Calibrate from './Calibrate.react';
import PostureButton from './PostureButton.react';


import {
  View,
  StyleSheet,
  Vibration,
  NativeAppEventEmitter,
  NativeModules,
} from 'react-native';

const MetaWearAPI = NativeModules.MetaWearAPI;

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class Posture extends Component {
  constructor() {
    super();

    this.state = {
      postureTime: 0,
      slouchTime: 0,
      slouches: 0,
      calibrating: false,
      monitoring: false,
    };

    this.startPostureMonitoring = this.startPostureMonitoring.bind(this);
    this.stopPostureMonitoring = this.stopPostureMonitoring.bind(this);
    this.beginCalibrate = this.beginCalibrate.bind(this);
    this.listenToSlouchEvent = null;
    this.listenToSlouchTime = null;
    this.listenToPostureTime = null;
  }

  componentWillMount() {
    const context = this;

    this.listenToSlouchEvent = NativeAppEventEmitter.addListener(
      'SlouchEvent', (event) => {
        Vibration.vibrate();
        context.setState({ slouches: event.slouch });
      }
    );

    this.listenToSlouchTime = NativeAppEventEmitter.addListener(
      'SlouchTime', (event) => {
        context.setState({ slouchTime: event.time });
      }
    );

    this.listenToPostureTime = NativeAppEventEmitter.addListener(
      'PostureTime', (event) => {
        context.setState({ postureTime: event.time });
      }
    );
  }

  componentWillUnmount() {
    this.listenToSlouchEvent.remove();
    this.listenToSlouchTime.remove();
    this.listenToPostureTime.remove();
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
          <View>
            <Monitor
              postureTime={this.state.postureTime}
              slouchTime={this.state.slouchTime}
              slouches={this.state.slouches}
            />
            {this.state.monitoring ?
              <PostureButton
                iconName={'pause'}
                buttonText={'STOP'}
                colorStyle={{ backgroundColor: '#f86c41' }}
                onPress={this.stopPostureMonitoring}
              /> :
              <PostureButton
                colorStyle={{ backgroundColor: '#48BBEC' }}
                onPress={this.beginCalibrate}
                buttonText={'START'}
              />
            }
          </View>
        }
      </View>
		);
  }
}

export default Posture;
