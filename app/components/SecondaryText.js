import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';
import reusableDefaults from './utils/reusableDefaults';

const SecondaryText = props => (
  <Text style={[styles._secondary, props.style]} {...reusableDefaults.fontScalingProps}>
    {props.children}
  </Text>
);

SecondaryText.propTypes = reusableDefaults.propTypes;
SecondaryText.defaultProps = reusableDefaults.defaultProps;

export default SecondaryText;
