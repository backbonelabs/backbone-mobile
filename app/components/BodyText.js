import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';

const { PropTypes } = React;

const BodyText = props => (
  <Text style={[styles._body, props.style]}>{props.children}</Text>
);

BodyText.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

BodyText.defaultProps = {
  style: {},
};

export default BodyText;
