import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';
import reusableDefaults from './utils/reusableDefaults';

const { PropTypes } = React;

const HeadingText = props => (
  <Text style={[styles[`_heading${props.size}`], props.style]}>{props.children}</Text>
);

HeadingText.propTypes = Object.assign({}, reusableDefaults.propTypes, {
  size: PropTypes.oneOf([1, 2, 3]).isRequired,
});

HeadingText.defaultProps = reusableDefaults.defaultProps;

export default HeadingText;
