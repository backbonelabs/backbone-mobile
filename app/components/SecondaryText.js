import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';

const { PropTypes } = React;

const SecondaryText = props => (
  <Text style={[styles._secondary, props.style]}>{props.children}</Text>
);

SecondaryText.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

SecondaryText.defaultProps = {
  style: {},
};

export default SecondaryText;
