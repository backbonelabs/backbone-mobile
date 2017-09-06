import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';
import reusableTextDefaults from './utils/reusableTextDefaults';

const { PropTypes } = React;
const { propTypes, defaultProps, fontScalingProps: { allowFontScaling } } = reusableTextDefaults;

const HeadingText = props => {
  const {
    size,
    style,
    ...remainingProps,
  } = props;

  return (
    <Text style={[styles[`_heading${size}`], style]} {...{ remainingProps, allowFontScaling }}>
      {props.children}
    </Text>
  );
};

HeadingText.propTypes = Object.assign({}, propTypes, {
  size: PropTypes.oneOf([1, 2, 3]).isRequired,
});

HeadingText.defaultProps = defaultProps;

export default HeadingText;
