import React, { Component } from 'react';
import {
  View,
  Image,
  Animated,
  Switch,
} from 'react-native';
import autobind from 'autobind-decorator';
import styles from '../../styles/posture/postureCalibrate';
import routes from '../../routes';
import HeadingText from '../HeadingText';
import BodyText from '../BodyText';
import SecondaryText from '../SecondaryText';
import Button from '../Button';
import sittingExample from '../../images/calibration/sittingExample.png';
import constants from '../../utils/constants';
import SensitiveInfo from '../../utils/SensitiveInfo';
import Mixpanel from '../../utils/Mixpanel';

const { PropTypes } = React;

const { storageKeys } = constants;

export default class PostureCalibrate extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      count: 0,
      fadeAnim: [new Animated.Value(0.4)],
      isCountingDown: false,
    };
  }

  componentDidMount() {
    SensitiveInfo.getItem(storageKeys.CALIBRATION_AUTO_START)
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
  @autobind
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
  @autobind
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
  @autobind
  toggleAutoStart(autoStart) {
    Mixpanel.track(`toggleAutoStart-${autoStart ? 'enabled' : 'diabled'}`);
    SensitiveInfo.setItem(storageKeys.CALIBRATION_AUTO_START, autoStart);
    this.setState({ autoStart });
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
            Get Ready
          </HeadingText>
          <BodyText style={styles._subtitle}>
            Sit or stand up straight while Backbone calibrates
          </BodyText>
        </View>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={sittingExample} />
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
        </View>
        <View style={styles.actionsContainer}>
          <Button
            {...buttonProps}
            onPress={() => this.setState({ isCountingDown: !this.state.isCountingDown })}
            text={this.state.isCountingDown ? 'PAUSE' : 'GO'}
          />
          <View style={styles.autoStartPreferenceContainer}>
            <View style={styles.autoStartPreferenceLabel}>
              <SecondaryText>
                Automatically start calibration next time
              </SecondaryText>
            </View>
            <View style={styles.autoStartPreferenceSwitch}>
              <Switch
                onValueChange={this.toggleAutoStart}
                value={this.state.autoStart}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}
