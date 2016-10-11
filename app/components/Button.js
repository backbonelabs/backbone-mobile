import React from 'react';
import {
  TouchableOpacity,
} from 'react-native';
import BodyText from './BodyText';
import styles from '../styles/button';

const Button = (props) => {
  const buttonStyles = [styles._button];
  const textStyles = [styles._text];
  if (props.disabled) {
    buttonStyles.push(styles._disabledButton);
    textStyles.push(styles._disabledText);
  }
  buttonStyles.push(props.style);
  textStyles.push(props.textStyle);

  return (
    <TouchableOpacity style={buttonStyles} onPress={props.disabled ? undefined : props.onPress}>
      <BodyText style={textStyles}>{props.text}</BodyText>
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
