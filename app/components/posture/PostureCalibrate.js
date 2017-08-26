import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Animated,
  Easing,
} from 'react-native';
import autobind from 'class-autobind';
import routes from '../../routes';
import HeadingText from '../HeadingText';
import BodyText from '../BodyText';
import Button from '../Button';
import progressCircle from '../../images/posture/calibration-progress-circle.png';
import styles from '../../styles/posture/postureCalibrate';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;
const originalHeight = applyWidthDifference(200);

export default class PostureCalibrate extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  }

  constructor() {
    super();
    autobind(this);
    this.state = {
      count: 0,
      isCountingDown: false,
      animatedHeightValue: new Animated.Value(originalHeight),
      blinderHeight: originalHeight,
    };
  }

  componentDidMount() {
    this._startAnimation();
  }

  /**
   * Starts the animation for shrinking the blinder's height
   */
  _startAnimation() {
    this.animatedTiming = Animated.timing(this.state.animatedHeightValue, {
      duration: 3000,
      toValue: 0,
      easing: Easing.inOut(Easing.ease),
    });
    this.animatedTiming.start(this._animationCallback);
  }

  /**
   * Handles post-animation logic
   * @param {Object} result Includes a `finished` property indicating whether the animation finished
   */
  _animationCallback({ finished }) {
    if (finished) {
      // Navigate to posture monitor
    }
  }

  /**
   * Updates the blinder height in state
   * @param {Object} event React Native synthetic touch event
   */
  _updateBlinderHeight(event) {
    this.setState({
      blinderHeight: event.nativeEvent.layout.height,
    });
  }

  render() {
    const buttonProps = {};
    if (!this.state.isCountingDown) {
      buttonProps.primary = true;
    }

    const percentage = Math.floor((1 - (this.state.blinderHeight / originalHeight)) * 100);

    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <HeadingText style={styles._title} size={2}>
            Calibrating
          </HeadingText>
          <BodyText style={styles._subtitle}>
            Continue to sit or stand up straight while Backbone calibrates
          </BodyText>
        </View>
        <Image source={progressCircle} style={styles.image}>
          <HeadingText size={1} style={styles._progressText}>{percentage}%</HeadingText>
          <BodyText style={styles._progressText}>CALIBRATED</BodyText>
          <Animated.View
            onLayout={this._updateBlinderHeight}
            style={[styles.blinder, { height: this.state.animatedHeightValue }]}
          />
        </Image>
        <View style={styles.actionsContainer}>
          <Button
            {...buttonProps}
            onPress={() => this.setState({ isCountingDown: !this.state.isCountingDown })}
            text={this.state.isCountingDown ? 'PAUSE' : 'RESUME'}
          />
        </View>
      </View>
    );
  }
}
