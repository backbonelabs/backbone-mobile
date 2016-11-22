import React, { PropTypes } from 'react';
import { Slider, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../.././../styles/posture/postureMonitor';

const MonitorSlider = (props) => (
  <View style={styles.sliderContainer}>
    <Icon name="minus" size={15} style={{ paddingRight: 5 }} />
    <View style={{ flex: 1 }}>
      <Slider
        minimumTrackTintColor={'#ED1C24'}
        {...props}
      />
    </View>
    <Icon name="plus" size={15} style={{ paddingLeft: 5 }} />
  </View>
);

MonitorSlider.propTypes = {
  onValueChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default MonitorSlider;
