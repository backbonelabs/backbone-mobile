import React, { Component, PropTypes } from 'react';
import Svg, { // eslint-disable-line
    Circle,
    LinearGradient,
    Defs,
    Stop,
} from 'react-native-svg';
import { Animated, View } from 'react-native';
import styles from '../.././../styles/posture/postureMonitor';
import relativeDimensions from '../../../utils/relativeDimensions';

const { widthDifference } = relativeDimensions;
const responsiveWidth = 136 * widthDifference;

class Monitor extends Component {
  static propTypes = {
    degree: PropTypes.number,
  }
  componentWillMount() {
    this.animatedValue = new Animated.Value(0);
  }
  componentDidMount() {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 1500,
    }).start();
  }
  render() {
    const { degree } = this.props;
    const interpolateRotation = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${degree}deg`],
    });
    const animatedStyle = {
      transform: [
        { rotate: interpolateRotation },
      ],
    };
    return (
      <View style={{ alignSelf: 'center' }}>
        <Svg
          height={responsiveWidth}
          width={responsiveWidth * 2}
        >
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2={responsiveWidth * 2} y2="0">
              <Stop offset="0" stopColor="#F0B24B" stopOpacity="1" />
              <Stop offset="1" stopColor="#ED1C24" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={responsiveWidth}
            cy={responsiveWidth}
            r={130 * widthDifference}
            stroke="#231F20"
            strokeWidth={3 * widthDifference}
            fill="url(#grad)"
          />
        </Svg>
        <Animated.View style={[styles.animationContainer, animatedStyle]}>
          <View style={styles.monitorPointerContainer}>
            <View style={styles.point} />
            <View style={styles.hand} />
            <View style={styles.base} />
          </View>
        </Animated.View>
      </View>
    );
  }
}

export default Monitor;
