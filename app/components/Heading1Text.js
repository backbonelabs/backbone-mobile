import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';

const { PropTypes } = React;

const Heading1Text = props => (
  <Text style={[styles._heading1, props.style]}>{props.children}</Text>
);

Heading1Text.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

Heading1Text.defaultProps = {
  style: {},
};

export default Heading1Text;
