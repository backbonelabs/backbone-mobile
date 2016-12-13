import React, { PropTypes } from 'react';
import { Slider, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../.././../styles/posture/postureMonitor';

const MonitorSlider = (props) => (
  <View style={styles.sliderContainer}>
    <Icon
      name="minus"
      size={styles.$sliderIconSize}
      style={{ paddingRight: styles.$sliderIconPadding }}
    />
    <View style={{ flex: 1 }}>
      <Slider
        minimumTrackTintColor={'#ED1C24'}
        {...props}
      />
    </View>
    <Icon
      name="plus"
      size={styles.$sliderIconSize}
      style={{ paddingLeft: styles.$sliderIconPadding }}
    />
  </View>
);

MonitorSlider.propTypes = {
  onValueChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default MonitorSlider;
