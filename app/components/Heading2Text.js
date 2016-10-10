import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';

const { PropTypes } = React;

const Heading2Text = props => (
  <Text style={[styles._heading2, props.style]}>{props.children}</Text>
);

Heading2Text.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

Heading2Text.defaultProps = {
  style: {},
};

export default Heading2Text;
