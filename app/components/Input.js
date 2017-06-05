
import React, { Component, PropTypes } from 'react';
import { TextInput, View } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/input';

// This is a map of font names to modules.
// To use other fonts supported by react-native-vector-icons,
// add an entry for the font in the iconMap hash and import
// the appropriate module.
const iconMap = {
  FontAwesome: FontAwesomeIcon,
  MaterialIcon: MaterialIcons,
};

class Input extends Component {
  static propTypes = {
    editable: PropTypes.bool,
    handleRef: PropTypes.func,
    style: PropTypes.object,
    iconStyle: PropTypes.object,
    containerStyles: PropTypes.object,
    iconFont: PropTypes.oneOf(['FontAwesome', 'MaterialIcon']),
    iconLeftName: PropTypes.string, // maps to a font name in react-native-icons
  };

  static defaultProps = {
    handleRef: () => {},
    style: {},
    iconFont: 'FontAwesome',
  };

  constructor(props) {
    super(props);

    this.state = {
      borderWidth: 0,
    };

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onFocus() {
    this.setState({
      borderWidth: 0.5,
    });
  }

  onBlur() {
    this.setState({
      borderWidth: 0,
    });
  }

  render() {
    const {
      handleRef,
      style,
      iconStyle,
      iconFont,
      iconLeftName,
      ...remainingProps,
    } = this.props;

    const inputStyles = [
      styles.inputField,
      { borderWidth: this.state.borderWidth },
    ];
    const iconStyles = [styles.icon];

    if (this.props.editable === false) {
      inputStyles.push(styles.disabled);
    }
    inputStyles.push(style);
    iconStyles.push(iconStyle);

    const Icon = iconMap[iconFont];

    return (
      <View style={[styles.container, this.props.containerStyles]}>
        {Icon && iconLeftName
          ? <Icon
            name={iconLeftName}
            color={styles.$iconColor}
            size={styles.$iconSize}
            style={iconStyles}
          />
          : null}
        <TextInput
          ref={ref => handleRef(ref)}
          style={inputStyles}
          placeholderTextColor={styles.$placeholderTextColor}
          underlineColorAndroid={'transparent'}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          {...remainingProps}
        />
      </View>
    );
  }
}

export default Input;
