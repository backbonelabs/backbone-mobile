import React, { PropTypes, Component } from 'react';
import {
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../../styles/posture/postureSummary';

const { height: deviceHeight } = Dimensions.get('window');

const ANIMATION_END_Y = Math.ceil(deviceHeight);

class AnimatedStar extends Component {
  static propTypes = {
    onComplete: PropTypes.func,
    style: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      position: new Animated.Value(0),
    };
  }
  componentWillMount() {
    this._yAnimation = this.state.position.interpolate({
      inputRange: [0, ANIMATION_END_Y],
      outputRange: [ANIMATION_END_Y, 0],
    });
    this._opacityAnimation = this._yAnimation.interpolate({
      inputRange: [0, ANIMATION_END_Y],
      outputRange: [0, 1],
    });
    this._scaleAnimation = this._yAnimation.interpolate({
      inputRange: [0, 15, 30],
      outputRange: [0, 1.2, 1],
      extrapolate: 'clamp',
    });
    this._xAnimation = this._yAnimation.interpolate({
      inputRange: [0, ANIMATION_END_Y / 2, ANIMATION_END_Y],
      outputRange: [0, 15, 0],
    });
    this._rotateAnimation = this._yAnimation.interpolate({
      inputRange: [
        0, ANIMATION_END_Y / 4, ANIMATION_END_Y / 3, ANIMATION_END_Y / 2, ANIMATION_END_Y,
      ],
      outputRange: ['0deg', '-10deg', '0deg', '10deg', '0deg'],
    });
  }
  componentDidMount() {
    Animated.timing(this.state.position, {
      duration: 6000,
      toValue: ANIMATION_END_Y,
    }).start(this.props.onComplete);
  }
  getHeartAnimationStyle() {
    return {
      transform: [
        { translateY: this.state.position },
        { translateX: this._xAnimation },
        { scale: this._scaleAnimation },
        { rotate: this._rotateAnimation },
      ],
      opacity: this._opacityAnimation,
    };
  }
  render() {
    return (
      <Animated.View style={[styles.starWrap, this.getHeartAnimationStyle(), this.props.style]}>
        <Icon name="star" size={styles.$starIconSize} color="#F0B24B" />
      </Animated.View>
    );
  }
}

export default AnimatedStar;
