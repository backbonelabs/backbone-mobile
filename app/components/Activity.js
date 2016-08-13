import React, { Component } from 'react';
import TimerMixin from 'react-timer-mixin';
import {
  View,
  Text,
  Image,
  // Vibration,
  NativeModules,
  // NativeAppEventEmitter,
} from 'react-native';
import styles from '../styles/activity';
import circle from '../images/circle.png';

const MetaWearAPI = NativeModules.MetaWearAPI;

export default class ActivityView extends Component {
  static propTypes = {
    slouchTime: React.PropTypes.number,
    postureTime: React.PropTypes.number,
  };

  constructor() {
    super();
    this.state = {
      steps: 0,
      timer: null,
      countdown: 1800000,
    };

    this.startCountdown = this.startCountdown.bind(this);
    this.stopCountdown = this.stopCountdown.bind(this);
  }

  componentWillMount() {
    // const context = this;

    MetaWearAPI.startActivityTracking();

    this.startCountdown();

    // const listenToStepEvent = NativeAppEventEmitter.addListener('Step',
    // (steps) => {
    //   context.setState({ steps: steps.step });
    // });

    // const listenToActiveEvent = NativeAppEventEmitter.addListener('Active',
    // () => {
    //   context.stopCountdown();
    //   context.setState({ countdown: 1800000 });
    // });

    // const listenToInactiveEvent = NativeAppEventEmitter.addListener('Inactive',
    // (poor) => {
    //   Vibration.vibrate();
    //   context.startCountdown();
    // });
  }

  stringFormatTime(seconds) {
    let time = seconds;
    let string = '';

    if (seconds >= 3600) {
      const hours = `${(time - (time % 3600)) / 3600}h`;
      time %= 3600;
      string += hours;
    }

    if (seconds >= 60) {
      const minutes = `${(time - (time % 60)) / 60}m`;
      time %= 60;
      string += minutes;
    }

    string += `${time % 60}s`;
    return string;
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
        <Image style={styles.circle} source={circle} />
        <Text style={styles.stepsText}>
          STEP
        </Text>
        <Text style={styles.steps}>
          {this.state.steps}
        </Text>
        <Text style={styles.timerText}>
          TIME UNTIL BREAK
        </Text>
        <Text style={styles.timer}>
          {this.stringFormatTime((this.state.countdown))}
        </Text>
      </View>
    );
  }
}
