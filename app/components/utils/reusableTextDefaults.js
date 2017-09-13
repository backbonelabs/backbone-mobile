import React from 'react';
import { Text } from 'react-native';

const { PropTypes } = React;

const propTypes = {
  allowFontScaling: PropTypes.bool,
  children: PropTypes.node,
  style: Text.propTypes.style,
};

const defaultProps = {
  style: {},
  allowFontScaling: false,
};

export default { propTypes, defaultProps };
