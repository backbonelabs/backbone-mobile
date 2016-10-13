import React, { Component } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import styles from '../../styles/posture/postureCalibrate';
import Button from '../Button';
import postureRoutes from '../../routes/posture';

const { PropTypes } = React;
const { width } = Dimensions.get('window');

export default class PostureCalibrate extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      count: 5,
      isCalibrating: false,
      animatedValues: new Animated.ValueXY(),
    };

    this.startCalibration = this.startCalibration.bind(this);
    this.stopCalibration = this.stopCalibration.bind(this);
    this.countdownHandler = this.countdownHandler.bind(this);
  }

  getScanAnimationStyle() {
    return [
      styles.calibrationScanAnimation,
      { transform: this.state.animatedValues.getTranslateTransform() },
    ];
  }

  startCalibration() {
    this.setState({ isCalibrating: true }, () => this.scanAnimation(this.state.count));
  }

  stopCalibration() {
    this.setState({
      count: 5,
      isCalibrating: false,
      animatedValues: new Animated.ValueXY(),
    });
  }

  countdownHandler() {
    if (this.state.isCalibrating) {
      this.setState({ count: this.state.count - 1 }, () => {
        if (this.state.count) {
          this.scanAnimation(this.state.count);
        } else {
          this.props.navigator.push(postureRoutes.postureMonitor);
        }
      });
    }
  }

  scanAnimation(count) {
    const valueX = count % 2 ? -1.02 * width : 0;

    Animated.timing(this.state.animatedValues, {
      duration: 1000,
      toValue: { x: valueX, y: 0 },
    }).start(this.countdownHandler);
  }

  render() {
    const buttonText = this.state.isCalibrating ? 'Stop' : 'Calibrate';
    const onPressHandler = this.state.isCalibrating ? this.stopCalibration : this.startCalibration;

    return (
      <View style={styles.container}>
        <View style={styles.animationContainer}>
          <View style={styles.calibrationImage}>
            { this.state.isCalibrating &&
              <Text style={styles.calibrationCountdown}>
                {this.state.count}
              </Text>
            }
          </View>
          <Animated.View style={this.getScanAnimationStyle()} />
        </View>
        <View style={styles.buttonContainer}>
          <Button text={buttonText} onPress={onPressHandler} />
        </View>
      </View>
    );
  }
}
