import React from 'react';
import { TextInput, View } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/input';
import theme from '../styles/theme';

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

  return (
    <View style={[styles.container, props.containerStyles]}>
      <TextInput
        ref={ref => handleRef(ref)}
        style={inputStyles}
        placeholderTextColor={theme.secondaryFontColor}
        underlineColorAndroid={'transparent'}
        {...remainingProps}
      />
      {Icon && iconRightName ?
        <Icon
          name={iconRightName}
          color={theme.primaryFontColor}
          size={theme.inputIconSize}
          style={styles.icon}
        />
        :
          <View style={{ ...styles._icon, width: theme.inputIconSize }} />
      }
    </View>
  );
};

const { PropTypes } = React;

Input.propTypes = {
  editable: PropTypes.bool,
  handleRef: PropTypes.func,
  style: PropTypes.object,
  containerStyles: PropTypes.object,
  iconFont: PropTypes.oneOf(['FontAwesome']),
  iconRightName: PropTypes.string, // maps to a font name in react-native-icons
};

Input.defaultProps = {
  handleRef: () => {},
  style: {},
  iconFont: 'FontAwesome',
};

export default Input;
