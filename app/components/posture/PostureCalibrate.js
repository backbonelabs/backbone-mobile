import React, { Component } from 'react';
import {
  View,
  Image,
  Animated,
} from 'react-native';
import { clone } from 'lodash';
import styles from '../../styles/posture/postureCalibrate';
import routes from '../../routes';
import HeadingText from '../HeadingText';
import SecondaryText from '../SecondaryText';

const { PropTypes } = React;
const calibrationImage = require('../../images/calibration/sittingExample.png');

export default class PostureCalibrate extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      count: 0,
      fadeAnim: [new Animated.Value(1)],
    };

    this.calibrationAnimation = this.calibrationAnimation.bind(this);
    this.calibrationAnimationHandler = this.calibrationAnimationHandler.bind(this);
  }

  componentWillMount() {
    this.calibrationAnimation();
  }

  /**
   * Animates and reduces the opacity of the calibration circles.
   * @param {Number}  index  Key of calibration circle. Used for
   *                         reducing the value of the appropriate
   *                         fadeAnim array item.
   */
  calibrationAnimation(index) {
    // Use Animated timing function in order to perform opacity
    // fade animation over the span of 1 second.
    Animated.timing(
      this.state.fadeAnim[index || 0],
      {
        duration: 1000,
        toValue: 0.4,
      }
    ).start(this.calibrationAnimationHandler);
  }

  /**
   * Handles post-animation calibration logic
   */
  calibrationAnimationHandler() {
    // Add new Animated value in order to properly animate
    // fading opacity for next calibration circle
    const fadeAnimClone = clone(this.state.fadeAnim);
    fadeAnimClone.push(new Animated.Value(1));

    this.setState({
      count: ++this.state.count,
      fadeAnim: fadeAnimClone,
    }, () => {
      // If calibration is over, send to session monitoring
      if (this.state.count > 5) {
        this.props.navigator.push(routes.postureMonitor);
      } else {
        this.calibrationAnimation(this.state.count);
      }
    });
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
            <SecondaryText style={{ textAlign: 'center' }}>
              Sit/Stand your straightest for 5 seconds! We're calibrating Backbone to your best
              posture.
            </SecondaryText>
          </View>
        </View>
        <View style={styles.image}>
          <Image source={calibrationImage} />
        </View>
        <View style={styles.calibrationCircleContainer}>
          {
            // Create 5 circles to represent calibration countdown
            ([...Array(5).keys()]).map((value, key) =>
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
    );
  }
}
