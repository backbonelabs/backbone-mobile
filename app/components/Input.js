import React from 'react';
import { TextInput, Platform, TouchableWithoutFeedback, View } from 'react-native';
import { omit } from 'lodash';
import styles from '../styles/input';

const { State: TextInputState } = TextInput;

const Input = (props) => {
  const {
    handleRef,
    style,
  } = props;
  const remainingProps = omit(props, ['handleRef', 'style']);

  const inputStyles = [styles.inputField];
  if (props.editable === false) {
    inputStyles.push(styles.disabled);
  }
  inputStyles.push(style);

  const inputField = (
    <TextInput
      ref={ref => handleRef(ref)}
      style={inputStyles}
      placeholderTextColor={styles._$placeholderTextColor}
      {...remainingProps}
    />
  );

  if (Platform.OS === 'ios') {
    // For iOS, the input field has to be wrapped in TouchableWithoutFeedback
    // and View to allow the keyboard to be hidden when the user taps outside
    // the input field
    return (
      <TouchableWithoutFeedback
        onPress={() => (
          TextInputState.blurTextInput(TextInputState.currentlyFocusedField())
        )}
      >
        <View>{inputField}</View>
      </TouchableWithoutFeedback>
    );
  }

  // For Android, the keyboard is hidden when using the back button
  return inputField;
};

const { PropTypes } = React;

Input.propTypes = {
  editable: PropTypes.bool,
  handleRef: PropTypes.func,
  style: PropTypes.object,
};

Input.defaultProps = {
  handleRef: () => {},
  style: {},
};

export default Input;
