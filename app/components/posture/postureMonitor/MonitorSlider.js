import React, { PropTypes } from 'react';
import { View } from 'react-native';
import RNSlider from 'react-native-slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from '../../../styles/posture/monitorSlider';
import theme from '../../../styles/theme';
import relativeDimensions from '../../../utils/relativeDimensions';

const MonitorSlider = ({ leftIcon, leftIconSize, rightIcon, rightIconSize, ...props }) => (
  <View style={styles.sliderContainer}>
    <MaterialIcons
      name={leftIcon}
      size={leftIconSize}
      style={styles.leftIconStyles}
    />
    <View style={styles.sliderInnerContainer}>
      <RNSlider
        trackStyle={styles.trackStyle}
        thumbStyle={[
          styles.thumbStyle,
          { backgroundColor: props.disabled ? theme.disabledColor : 'white' },
        ]}
        {...props}
      />
    </View>
    <MaterialIcons
      name={rightIcon}
      size={rightIconSize}
      style={styles.rightIconStyles}
    />
  </View>
);

MonitorSlider.propTypes = {
  rightIcon: PropTypes.string,
  leftIcon: PropTypes.string,
  rightIconSize: PropTypes.number,
  leftIconSize: PropTypes.number,
  disabled: PropTypes.bool,
};

MonitorSlider.defaultProps = {
  leftIconSize: relativeDimensions.fixedResponsiveFontSize(30),
  rightIconSize: relativeDimensions.fixedResponsiveFontSize(30),
  minimumTrackTintColor: theme.lightBlueColor,
  leftIcon: 'remove',
  rightIcon: 'add',
};

export default MonitorSlider;
