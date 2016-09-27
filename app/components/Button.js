import React from 'react';
import {
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../styles/button';

const Button = (props) => {
  const buttonStyles = [styles.button];
  if (props.disabled) {
    buttonStyles.push(styles.disabled);
  }
  buttonStyles.push(props.style);
  return (
    <TouchableOpacity style={buttonStyles} onPress={props.disabled ? undefined : props.onPress}>
      <Text style={[styles.text, props.textStyle]}>{props.text}</Text>
    </TouchableOpacity>
  );
};

const { PropTypes } = React;

Button.propTypes = {
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  style: PropTypes.object,
  text: PropTypes.string.isRequired,
  textStyle: PropTypes.object,
};

Button.defaultProps = {
  style: {},
  textStyle: {},
};

export default Button;
