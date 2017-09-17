import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Animated,
  Easing,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import routes from '../../routes';
import HeadingText from '../HeadingText';
import BodyText from '../BodyText';
import Button from '../Button';
import progressCircle from '../../images/posture/calibration-progress-circle.png';
import styles from '../../styles/posture/postureCalibrate';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;
const originalHeight = applyWidthDifference(200);

class PostureCalibrate extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
    onFinish: PropTypes.func,
    training: PropTypes.shape({
      selectedLevelIdx: PropTypes.number.isRequired,
    }).isRequired,
  }

  constructor() {
    super();
    autobind(this);
    this.state = {
      isAnimating: false,
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
    this.setState({
      isAnimating: true,
    }, () => {
      this.animatedTiming = Animated.timing(this.state.animatedHeightValue, {
        duration: 3000,
        toValue: 0,
        easing: Easing.inOut(Easing.ease),
      });
      this.animatedTiming.start(this._animationCallback);
    });
  }

  /**
   * Handles post-animation logic
   * @param {Object} result Includes a `finished` property indicating whether the animation finished
   */
  _animationCallback({ finished }) {
    if (finished) {
      // Navigate to posture monitor after a slight pause
      setTimeout(() => {
        if (this.props.onFinish) {
          this.props.onFinish();
        } else {
          this.props.navigator.replace(routes.postureMonitor);
        }
      }, 200);
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

  _toggleAnimation() {
    this.setState(prevState => ({
      isAnimating: !prevState.isAnimating,
    }), () => {
      const { isAnimating } = this.state;
      if (!isAnimating) {
        this.animatedTiming.stop();
      } else {
        this.animatedTiming.start(this._animationCallback);
      }
    });
  }

  render() {
    const percentage = Math.floor((1 - (this.state.blinderHeight / originalHeight)) * 100);

    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <HeadingText style={styles.title} size={1}>
            Calibrating...
          </HeadingText>
          <HeadingText size={3} style={styles.subtitle}>
            Continue to sit or stand up straight while BACKBONE calibrates
          </HeadingText>
          <Image source={progressCircle} style={styles.progressCircle}>
            <HeadingText size={1} style={styles.progressText}>{percentage}%</HeadingText>
            <BodyText style={styles.progressText}>CALIBRATED</BodyText>
            <Animated.View
              onLayout={this._updateBlinderHeight}
              style={[styles.blinder, { height: this.state.animatedHeightValue }]}
            />
          </Image>
        </View>
        <Button
          primary
          style={styles.button}
          onPress={this._toggleAnimation}
          text={this.state.isAnimating ? 'PAUSE' : 'RESUME'}
          disabled={percentage === 100}
        />
      </View>
    );
  }
}

const mapStateToProps = ({ training }) => ({
  training,
});

export default connect(mapStateToProps)(PostureCalibrate);
