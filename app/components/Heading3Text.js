import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';

const { PropTypes } = React;

const Heading3Text = props => (
  <Text style={[styles._heading3, props.style]}>{props.children}</Text>
);

Heading3Text.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

Heading3Text.defaultProps = {
  style: {},
};

export default Heading3Text;
