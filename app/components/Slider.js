import React, { PropTypes } from 'react';
import { View } from 'react-native';
import RNSlider from 'react-native-slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/slider';
import theme from '../styles/theme';
import relativeDimensions from '../utils/relativeDimensions';

const Slider = ({ leftIcon, leftIconSize, rightIcon, rightIconSize, customStyles, ...props }) => (
  <View style={[styles.sliderContainer, customStyles.sliderContainer]}>
    {
      leftIcon ?
        <MaterialIcons
          name={leftIcon}
          size={leftIconSize}
          style={[styles.leftIconStyles, customStyles.leftIconStyles]}
        /> : null
    }
    <View style={[styles.sliderInnerContainer, customStyles.sliderInnerContainer]}>
      <RNSlider
        trackStyle={[styles.trackStyle, customStyles.trackStyle]}
        thumbStyle={[styles.thumbStyle, customStyles.thumbStyle]}
        {...props}
      />
    </View>
    {
      rightIcon ?
        <MaterialIcons
          name={rightIcon}
          size={rightIconSize}
          style={[styles.rightIconStyles, customStyles.rightIconStyles]}
        /> : null
    }

  </View>
);

Slider.propTypes = {
  rightIcon: PropTypes.string,
  leftIcon: PropTypes.string,
  rightIconSize: PropTypes.number,
  leftIconSize: PropTypes.number,
  customStyles: PropTypes.shape({
    leftIconStyles: MaterialIcons.propTypes.style,
    rightIconStyles: MaterialIcons.propTypes.style,
    thumbStyle: View.propTypes.style,
    trackStyle: View.propTypes.style,
    sliderContainer: View.propTypes.style,
    sliderInnerContainer: View.propTypes.style,
  }),
};

Slider.defaultProps = {
  leftIconSize: relativeDimensions.fixedResponsiveFontSize(30),
  rightIconSize: relativeDimensions.fixedResponsiveFontSize(30),
  minimumTrackTintColor: theme.lightBlueColor,
  customStyles: {},
};

export default Slider;
