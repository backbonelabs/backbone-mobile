import React from 'react';
import {
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../styles/button';

const Button = props => (
  <TouchableOpacity style={[styles.button, props.style]} onPress={props.onPress}>
    <Text style={[styles.text, props.textStyle]}>{props.text}</Text>
  </TouchableOpacity>
);

Button.propTypes = {
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
