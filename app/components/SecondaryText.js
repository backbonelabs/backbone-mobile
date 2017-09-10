import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/text';
import reusableTextDefaults from './utils/reusableTextDefaults';

const SecondaryText = props => {
  const {
    style,
    ...remainingProps,
  } = props;

  return (
    <Text style={[styles.secondary, style]} {...remainingProps}>
      {props.children}
    </Text>
  );
};

SecondaryText.propTypes = reusableTextDefaults.propTypes;
SecondaryText.defaultProps = reusableTextDefaults.defaultProps;

export default SecondaryText;
