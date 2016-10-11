import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';
import reusableDefaults from './utils/reusableDefaults';

const BodyText = props => (
  <Text style={[styles._body, props.style]}>{props.children}</Text>
);

BodyText.propTypes = reusableDefaults.propTypes;
BodyText.defaultProps = reusableDefaults.defaultProps;

export default BodyText;
