import React, { PropTypes } from 'react';
import Svg, { // eslint-disable-line
    Circle,
    LinearGradient,
    Defs,
    Stop,
} from 'react-native-svg';
import { View } from 'react-native';
import styles from '../.././../styles/posture/postureMonitor';
import relativeDimensions from '../../../utils/relativeDimensions';

const { widthDifference } = relativeDimensions;
const responsiveWidth = 136 * widthDifference;

const Monitor = (props) => {
  const { pointerPosition, slouchPosition } = props;

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
      <View style={styles.halfCircleOuterContainer}>
        <View
          style={[
            { transform: [{ rotate: `${slouchPosition}deg` }] },
            styles.halfCircleInnerContainer,
          ]}
        >
          <View style={styles.halfCircle} />
        </View>
      </View>
      <View
        style={[
          { transform: [{ rotate: `${pointerPosition}deg` }] },
          styles.monitorPointerContainer,
        ]}
      >
        <View style={styles.base} />
        <View style={styles.hand} />
        <View style={styles.point} />
      </View>
    </View>
  );
};

Monitor.propTypes = {
  pointerPosition: PropTypes.number,
  slouchPosition: PropTypes.number,
};

export default Monitor;
