import React from 'react';
import { Platform } from 'react-native';

const { PropTypes } = React;

const propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

const defaultProps = {
  style: {},
};

const fontScalingProps = Platform.select({
  ios: { allowFontScaling: false },
});

export default { propTypes, defaultProps, fontScalingProps };
