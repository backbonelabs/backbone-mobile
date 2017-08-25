import React, { Component, PropTypes } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import autobind from 'class-autobind';
import { TouchableHighlight, View, Text } from 'react-native';
import styles from '../../../styles/posture/monitorButton';
import SecondaryText from '../../SecondaryText';
import theme from '../../../styles/theme';
import relativeDimensions from '../../../utils/relativeDimensions';

class MonitorButton extends Component {
  static propTypes = {
    color: PropTypes.string,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    iconSize: PropTypes.number,
    text: PropTypes.string,
    textColor: PropTypes.string,
    underlayIconColor: PropTypes.string,
    customStyles: PropTypes.shape({
      icon: MaterialIcons.propTypes.style,
      container: View.propTypes.style,
      button: View.propTypes.style,
      text: Text.propTypes.object,
    }),
  };

  static defaultProps = {
    color: 'white',
    underlayColor: theme.lightBlueColor,
    underlayIconColor: 'white',
    iconSize: relativeDimensions.fixedResponsiveFontSize(40),
    iconColor: theme.lightBlueColor,
    textColor: theme.secondaryFontColor,
    activeOpacity: 1,
    customStyles: {},
  };

  constructor() {
    super();
    autobind(this);

    this.state = {
      pressStatus: false,
    };
  }

  _onHideUnderlay() {
    this.setState({ pressStatus: false });
  }

  _onShowUnderlay() {
    this.setState({ pressStatus: true });
  }

  render() {
    const {
      color,
      icon,
      iconColor,
      iconSize,
      text,
      textColor,
      underlayIconColor,
      customStyles,
      ...otherProps,
    } = this.props;
    const currentIconColor = this.state.pressStatus ? underlayIconColor : iconColor;
    const currentTextColor = this.state.pressStatus ? otherProps.underlayColor : textColor;

    return (
      <View style={customStyles.container}>
        <TouchableHighlight
          style={[styles.monitorBtn, customStyles.button, { backgroundColor: color }]}
          activeOpacity={otherProps.activeOpacity}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          {...otherProps}
        >
          {
            icon ?
              <MaterialIcons
                name={icon}
                size={iconSize}
                color={otherProps.disabled ? theme.disabledColor : currentIconColor}
                style={customStyles.icon}
              /> : null
          }
        </TouchableHighlight>
        {
          text ?
            <SecondaryText
              style={[styles._btnText, customStyles.text, { color: currentTextColor }]}
            >
              {text}
            </SecondaryText> : null
        }
      </View>
    );
  }

}

export default MonitorButton;
