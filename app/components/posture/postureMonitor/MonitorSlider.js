import React, { PropTypes } from 'react';
import { Slider, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../.././../styles/posture/postureMonitor';

const MonitorSlider = (props) => (
  <View style={styles.sliderContainer}>
    <Icon name="minus" style={{ top: 14 }} />
    <View style={{ flex: 1 }}>
      <Slider
        minimumTrackTintColor={'#ED1C24'}
        minimumValue={0.1}
        maximumValue={1}
        onValueChange={props.onValueChange}
      />
    </View>
    <Icon name="plus" style={{ top: 14 }} />
  </View>
);

MonitorSlider.propTypes = {
  onValueChange: PropTypes.func,
};

export default MonitorSlider;
