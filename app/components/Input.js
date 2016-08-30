import React from 'react';
import { TextInput, Platform, ScrollView, View } from 'react-native';
import { omit } from 'lodash';
import styles from '../styles/input';

const Input = props => {
  const {
    handleRef,
    style,
  } = props;
  const remainingProps = omit(props, ['handleRef', 'style']);

  const inputField = (
    <TextInput
      ref={ref => {
        handleRef(ref);
      }}
      style={[styles.inputField, style]}
      {...remainingProps}
    />
  );

  if (Platform.OS === 'ios') {
    // For iOS, the ScrollView allows the keyboard to be
    // hidden when the user taps outside the input field.
    // In addition, the TextInput must be wrapped with a View
    // to properly show borders and have margins added.
    return (
      <ScrollView scrollEnabled={false} keyboardShouldPersistTaps={false}>
        <View style={styles.inputFieldContainer}>{inputField}</View>
      </ScrollView>
    );
  }

  // For Android, the keyboard is hidden when using the back button,
  // and a bottom border and margins are added automatically
  return inputField;
};

const { PropTypes } = React;

Input.propTypes = {
  handleRef: PropTypes.func,
  style: PropTypes.object,
};

Input.defaultProps = {
  handleRef: () => {},
  style: {},
};

export default Input;
