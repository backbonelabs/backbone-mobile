import React from 'react';
import { TextInput, Platform, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/input';

const { State: TextInputState } = TextInput;

// This is a map of font names to modules.
// To use other fonts supported by react-native-vector-icons,
// add an entry for the font in the iconMap hash and import
// the appropriate module.
const iconMap = {
  FontAwesome: FontAwesomeIcon,
};

const Input = (props) => {
  const {
    handleRef,
    style,
    iconFont,
    iconRightName,
    ...remainingProps,
  } = props;

  const inputStyles = [styles.inputField];
  if (props.editable === false) {
    inputStyles.push(styles.disabled);
  }
  inputStyles.push(style);

  const Icon = iconMap[iconFont];

  const inputField = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TextInput
        ref={ref => handleRef(ref)}
        style={inputStyles}
        placeholderTextColor={styles._$placeholderTextColor}
        {...remainingProps}
      />
      {Icon && iconRightName ?
        <Icon name={iconRightName} color={styles._icon.color} size={16} style={styles.icon} />
        : null}
    </View>
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
        {inputField}
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
  iconFont: PropTypes.oneOf(['FontAwesome']),
  iconRightName: PropTypes.string, // maps to a font name in react-native-icons
};

Input.defaultProps = {
  handleRef: () => {},
  style: {},
  iconFont: 'FontAwesome',
};

export default Input;
