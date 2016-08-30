import React from 'react';
import {
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../styles/button';

const Button = props => {
  const buttonStyles = [styles.button];
  if (props.disabled) {
    buttonStyles.push(styles.disabled);
  }
  buttonStyles.push(props.style);
  return (
    <TouchableOpacity style={buttonStyles} onPress={props.onPress}>
      <Text style={[styles.text, props.textStyle]}>{props.text}</Text>
    </TouchableOpacity>
    );
};

Button.propTypes = {
  disabled: React.PropTypes.bool,
  onPress: React.PropTypes.func,
  style: React.PropTypes.object,
  text: React.PropTypes.string.isRequired,
  textStyle: React.PropTypes.object,
};

Button.defaultProps = {
  style: {},
  textStyle: {},
};

export default Button;
