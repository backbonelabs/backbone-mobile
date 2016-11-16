import React, { Component } from 'react';
import {
  View,
  Image,
  Animated,
  Switch,
} from 'react-native';
import styles from '../../styles/posture/postureCalibrate';
import routes from '../../routes';
import HeadingText from '../HeadingText';
import BodyText from '../BodyText';
import Button from '../Button';
import calibrationImage from '../../images/calibration/sittingExample.png';
import constants from '../../utils/constants';
import SensitiveInfo from '../../utils/SensitiveInfo';

const { PropTypes } = React;

export default class PostureCalibrate extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      count: 0,
      fadeAnim: [new Animated.Value(1)],
      isCountingDown: false,
    };

    this.startAnimation = this.startAnimation.bind(this);
    this.animationCallback = this.animationCallback.bind(this);
    this.toggleAutoStart = this.toggleAutoStart.bind(this);
  }

  componentDidMount() {
    SensitiveInfo.getItem(constants.calibrationAutoStartStorageKey)
      .then(autoStart => {
        const newState = { autoStart };
        if (autoStart) {
          newState.isCountingDown = true;
        }
        this.setState(newState);
      });
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
        toValue: 0.4,
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

  /**
   * Toggles the auto-start preference for the calibration countdown and the
   * new preference will be stored on the device for subsequent sessions
   * @param {Boolean} autoStart
   */
  toggleAutoStart(autoStart) {
    SensitiveInfo.setItem(constants.calibrationAutoStartStorageKey, autoStart);
    this.setState({ autoStart });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <View style={styles.headingText}>
            <HeadingText size={3}>
              Get Ready
            </HeadingText>
          </View>
          <View style={styles.secondaryText}>
            <BodyText style={{ textAlign: 'center' }}>
              Sit or stand up straight while Backbone calibrates
            </BodyText>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={calibrationImage}
            style={styles.image}
          />
        </View>
        <View style={styles.calibrationCircleContainer}>
          {
            // Create 5 circles to represent calibration countdown
            [0, 1, 2, 3, 4].map((value, key) =>
              <Animated.View
                key={key}
                style={[
                  styles.calibrationCircle,
                  this.state.count >= key && { opacity: this.state.fadeAnim[key] },
                ]}
              />
            )
          }
        </View>
        <Button
          style={styles.startButton}
          primary
          onPress={() => this.setState({ isCountingDown: !this.state.isCountingDown })}
          text={this.state.isCountingDown ? 'Pause' : 'Start'}
        />
        <View style={styles.autoStartPreferenceContainer}>
          <Switch
            onValueChange={this.toggleAutoStart}
            value={this.state.autoStart}
          />
        </View>
      </View>
    );
  }
}
