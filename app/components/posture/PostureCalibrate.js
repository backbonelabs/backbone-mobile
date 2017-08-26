import React, { Component } from 'react';
import {
  View,
  Image,
  Animated,
} from 'react-native';
import autobind from 'class-autobind';
import routes from '../../routes';
import HeadingText from '../HeadingText';
import BodyText from '../BodyText';
import Button from '../Button';
import progressCircle from '../../images/posture/calibration-progress-circle.png';
import styles from '../../styles/posture/postureCalibrate';

const { PropTypes } = React;

export default class PostureCalibrate extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  }

  constructor() {
    super();
    autobind(this);
    this.state = {
      count: 0,
      fadeAnim: [new Animated.Value(0.4)],
      isCountingDown: false,
    };
  }

  componentDidMount() {
    // this.startAnimation();
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.isCountingDown && nextState.isCountingDown) {
      // Start countdown
      this.startAnimation(this.state.count);
    }
    if (this.state.isCountingDown && !nextState.isCountingDown) {
      // Stop countdown
      const currentAnimation = this.state.fadeAnim[this.state.count];
      currentAnimation.stopAnimation();
    }
  }

  /**
   * Animates and reduces the opacity of a calibration circle. Uses the Animated.timing API
   * to animate the opacity, and the Animated.Values are stored in the state's fadeAnim array
   * @param {Number} index=0 Index of the calibration circle to animate
   */
  startAnimation(index = 0) {
    // Use Animated timing function in order to perform opacity
    // fade animation over the span of 1 second.
    this.animatedTiming = Animated.timing(
      this.state.fadeAnim[index],
      {
        duration: 1000,
        toValue: 1,
      }
    );
    this.animatedTiming.start(this.animationCallback);
  }

  /**
   * Handles post-animation calibration logic
   * @param {Object} result Includes a `finished` property indicating whether the animation finished
   */
  animationCallback({ finished }) {
    if (finished) {
      // Add new Animated.Value in order to properly animate
      // fading opacity for next calibration circle
      const fadeAnimClone = [...this.state.fadeAnim];
      fadeAnimClone.push(new Animated.Value(1));

      this.setState({
        count: this.state.count + 1,
        fadeAnim: fadeAnimClone,
      }, () => {
        if (this.state.count >= 5) {
          // Calibration is over, send to session monitoring
          this.props.navigator.replace(routes.postureMonitor);
        } else {
          // Calibration not complete yet, animate next calibrate circle
          this.startAnimation(this.state.count);
        }
      });
    }
  }

  render() {
    const buttonProps = {};
    if (!this.state.isCountingDown) {
      buttonProps.primary = true;
    }

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
        <Image source={progressCircle} style={styles.image} />
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
