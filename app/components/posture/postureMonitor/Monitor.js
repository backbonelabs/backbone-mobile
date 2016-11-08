import React from 'react';
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

const Monitor = () => (
  <View style={{ alignSelf: 'center' }}>
    <Svg
      height="135"
      width="275"
    >
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="200" y2="0">
          <Stop offset="0" stopColor="rgb(240,185,77)" stopOpacity="1" />
          <Stop offset="1" stopColor="rgb(237,28,36)" stopOpacity="2" />
        </LinearGradient>
      </Defs>
      <Circle
        cx="140"
        cy="130"
        r={130 * widthDifference}
        stroke="black"
        strokeWidth="3.5"
        fill="url(#grad)"
        originY={100}
        rotate={2}
      />
    </Svg>
    <View style={styles.monitorPointer}>
      <View style={styles.point} />
      <View style={styles.hand} />
      <View style={styles.base} />
    </View>
  </View>
);

export default Monitor;
