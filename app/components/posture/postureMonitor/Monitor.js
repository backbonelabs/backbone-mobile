import React from 'react';
import { View } from 'react-native';
import styles from '../.././../styles/posture/postureMonitor';

const Monitor = () => (
  <View style={styles.monitor}>
    <View style={styles.monitorPointWrapper}>
      <View style={styles.monitorHand} />
      <View style={styles.monitorPoint} />
    </View>
  </View>
);

export default Monitor;
