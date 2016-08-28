import React, { Component } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import styles from '../../styles/posture/postureCalibrate';
import PostureButton from './PostureButton';
import postureRoutes from '../../routes/posture';

const { width } = Dimensions.get('window');

export default class PostureCalibrate extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      count: 5,
      countdown: false,
      animatedValues: new Animated.ValueXY(),
    };

    this.startCountdown = this.startCountdown.bind(this);
    this.stopCountdown = this.stopCountdown.bind(this);
    this.countdownHandler = this.countdownHandler.bind(this);
  }

  getStepStyle() {
    return [
      styles.calibrateAnimation,
      { transform: this.state.animatedValues.getTranslateTransform() },
    ];
  }

  startCountdown() {
    this.setState({ countdown: true }, () => this.animationSequence(this.state.count));
  }

  stopCountdown() {
    this.setState({
      count: 5,
      countdown: false,
      animatedValues: new Animated.ValueXY(),
    });
  }

  countdownHandler() {
    if (this.state.countdown) {
      this.setState({ count: this.state.count - 1 }, () => {
        if (this.state.count) {
          this.animationSequence(this.state.count);
        } else {
          // TODO: Set posture tilt/distance threshold here
          this.props.navigator.push(postureRoutes.postureMonitor);
        }
      });
    }
  }

  animationSequence(count) {
    const valueX = count % 2 ? -1.02 * width : 0;

    Animated.timing(this.state.animatedValues, {
      duration: 1500,
      toValue: { x: valueX, y: 0 },
    }).start(this.countdownHandler);
  }

  render() {
    let buttonText = this.state.countdown ? 'Stop' : 'Start';
    let onPressHandler = this.state.countdown ? this.stopCountdown : this.startCountdown;

    return (
      <View style={styles.container}>
        <View style={styles.calibrateContainer}>
          <View style={styles.calibrateImage}>
          { this.state.countdown &&
            <Text style={styles.calibrateCountdown}>
              {this.state.count}
            </Text>
          }
          </View>
          <Animated.View style={this.getStepStyle()} />
        </View>
        <View style={styles.buttonContainer}>
          <PostureButton text={buttonText} onPress={onPressHandler} />
        </View>
      </View>
    );
  }
}
