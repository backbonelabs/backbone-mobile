import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';
import reusableTextDefaults from './utils/reusableTextDefaults';

const SecondaryText = props => (
  <Text style={[styles.secondary, props.style]} {...reusableTextDefaults.fontScalingProps}>
    {props.children}
  </Text>
);

SecondaryText.propTypes = reusableTextDefaults.propTypes;
SecondaryText.defaultProps = reusableTextDefaults.defaultProps;

export default SecondaryText;
