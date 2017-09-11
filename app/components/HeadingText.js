import React, { PropTypes } from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';
import reusableTextDefaults from './utils/reusableTextDefaults';

const { propTypes, defaultProps } = reusableTextDefaults;

const HeadingText = props => {
  const {
    size,
    style,
    ...remainingProps,
  } = props;

  return (
    <Text style={[styles[`heading${size}`], style]} {...remainingProps}>
      {props.children}
    </Text>
  );
};

HeadingText.propTypes = Object.assign({}, propTypes, {
  size: PropTypes.oneOf([1, 2, 3]).isRequired,
});

HeadingText.defaultProps = defaultProps;

export default HeadingText;
