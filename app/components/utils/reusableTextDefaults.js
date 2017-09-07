import React from 'react';
import { Platform, Text } from 'react-native';

const { PropTypes } = React;

const propTypes = {
  children: PropTypes.node,
  style: Text.propTypes.style,
};

const defaultProps = {
  style: {},
};

const fontScalingProps = Platform.select({
  ios: { allowFontScaling: false },
  android: {},
});

export default { propTypes, defaultProps, fontScalingProps };
