import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';

const { PropTypes } = React;

const HeadingText = props => (
  <Text style={[styles[`_heading${props.size}`], props.style]}>{props.children}</Text>
);

HeadingText.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
  size: PropTypes.oneOf([1, 2, 3]).isRequired,
};

HeadingText.defaultProps = {
  style: {},
};

export default HeadingText;
