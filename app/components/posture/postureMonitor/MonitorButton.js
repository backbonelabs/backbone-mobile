import React, { Component, PropTypes } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import autobind from 'class-autobind';
import { TouchableHighlight, View } from 'react-native';
import styles from '../../../styles/posture/postureMonitor';
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
  };

  static defaultProps = {
    color: 'white',
    icon: 'play-arrow',
    underlayColor: theme.lightBlueColor,
    underlayIconColor: 'white',
    iconSize: relativeDimensions.fixedResponsiveFontSize(40),
    iconColor: theme.lightBlueColor,
    textColor: theme.secondaryFontColor,
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
      ...otherProps,
    } = this.props;
    const currentIconColor = this.state.pressStatus ? underlayIconColor : iconColor;
    const currentTextColor = this.state.pressStatus ? otherProps.underlayColor : textColor;

    return (
      <View>
        <TouchableHighlight
          style={[styles.monitorBtn, { backgroundColor: color }]}
          activeOpacity={1}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          {...otherProps}
        >
          <MaterialIcons
            name={icon}
            size={iconSize}
            color={otherProps.disabled ? theme.secondaryFontColor : currentIconColor}
          />
        </TouchableHighlight>
        { text ?
          <SecondaryText
            style={[styles._btnText, { color: currentTextColor }]}
          >
            {text}
          </SecondaryText> : null
      }
      </View>
    );
  }

}

export default MonitorButton;
