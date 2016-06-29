import React, { Component } from 'react';
// import Progress from 'react-native-progress';
import TimerMixin from 'react-timer-mixin';

import {
  View,
  Text,
  Image,
  Vibration,
  StyleSheet,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';

const MetaWearAPI = NativeModules.MetaWearAPI;

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    alignItems: 'center',
    flexDirection: 'column',
  },
  steps: {
    fontSize: 120,
    marginTop: -110,
    marginBottom: 60,
    color: '#f86c41',
    fontWeight: '500',
  },
  stepsText: {
    fontSize: 24,
    marginTop: -275,
    marginBottom: 100,
    color: '#9da2a7',
    fontWeight: '500',
  },
  timer: {
    marginTop: 5,
    fontSize: 53,
    fontFamily: 'Helvetica',
    color: '#f86c41',
    fontWeight: '500',
  },
  timerText: {
    fontSize: 24,
    marginTop: 40,
    color: '#9da2a7',
    alignItems: 'center',
    fontWeight: '500',
  },
  circle: {
    marginTop: -275,
    marginBottom: 65,
    width: 255,
    height: 255,
    borderRadius: 255 / 2,
    borderWidth: 15,
    borderColor: 'white',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  progressPie: {
    marginTop: 35,
    alignSelf: 'center',
  },
});

class ActivityView extends Component {
  constructor() {
    super();
    this.state = {
      steps: 0,
      timer: null,
      countdown: 1800000,
    };

    this.convertTotalTime = this.convertTotalTime.bind(this);
    this.startCountdown = this.startCountdown.bind(this);
    this.stopCountdown = this.stopCountdown.bind(this);
  }

  componentWillMount() {
    const context = this;

    MetaWearAPI.startActivityTracking();

    this.startCountdown();

    const listenToStepEvent = NativeAppEventEmitter.addListener('Step',
    (steps) => {
      context.setState({ steps: steps.step });
    });

    const listenToActiveEvent = NativeAppEventEmitter.addListener('Active',
    () => {
      context.stopCountdown();
      context.setState({ countdown: 1800000 });
    });

    const listenToInactiveEvent = NativeAppEventEmitter.addListener('Inactive',
    (poor) => {
      Vibration.vibrate();
      context.startCountdown();
    });
  }

  startCountdown() {
    const context = this;
    this.state.timer = TimerMixin.setInterval(() => {
      const tick = context.state.countdown - 1000;
      context.setState({
        countdown: tick,
      });
    }, 1000);
  }

  stopCountdown() {
    TimerMixin.clearInterval(this.state.timer);
  }

  convertTotalTime(milliseconds) {
    let timeString = '';
    const seconds = milliseconds / 1000;

    if (seconds > 60) {
      timeString = `${(seconds - (seconds % 60)) / 60}m ${seconds % 60}s`;
    } else if (seconds > 3600) {
      timeString = `${(seconds - (seconds % 360)) / 360}h ${(seconds - (seconds % 60)) / 60}m ${seconds % 60}s`;
    } else {
      timeString = `0h 0m ${seconds}s`;
    }
    return timeString;
  }

  render() {
    return (
      <View style={styles.container}>
{/*        <Progress.Pie
          style={styles.progressPie}
          color="#48BBEC"
          unfilledColor="#f86c41"
          borderWidth={0}
          progress={(this.state.countdown + 0.01) / 1800000}
          size={300}
        />*/}
        <Image style={styles.circle} source={require('../images/circle.png')} />
        <Text style={styles.stepsText}>
          STEP
        </Text>
        <Text style={styles.steps}>
          { this.state.steps }
        </Text>
        <Text style={styles.timerText}>
          TIME UNTIL BREAK
        </Text>
        <Text style={styles.timer}>
          { this.convertTotalTime((this.state.countdown))}
        </Text>
      </View>
    );
  }
}

ActivityView.propTypes = {
  slouchTime: React.PropTypes.number,
  postureTime: React.PropTypes.number,
};

export default ActivityView;
