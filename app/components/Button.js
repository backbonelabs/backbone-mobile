import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableHighlight,
} from 'react-native';
import BodyText from './BodyText';
import styles from '../styles/button';


class Button extends Component {

  static propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    style: PropTypes.object,
    text: PropTypes.string.isRequired,
    textStyle: PropTypes.object,
    primary: PropTypes.bool,
    pressStatus: PropTypes.bool,
    onHideUnderlay: PropTypes.func,
    onShowUnderlay: PropTypes.func,
  }

  static defaultProps = {
    style: {},
    textStyle: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      pressStatus: false,
    };

    this._onHideUnderlay = this._onHideUnderlay.bind(this);
    this._onShowUnderlay = this._onShowUnderlay.bind(this);
  }

  _onHideUnderlay() {
    this.setState({ pressStatus: false });
  }
  _onShowUnderlay() {
    this.setState({ pressStatus: true });
  }

  render() {
    let buttonType;
    const textStyles = [styles._text];
    const buttonStyles = [styles._button];
    const buttonActive = [buttonStyles, styles._buttonActive];
    const secondaryStyles = [buttonStyles, styles._secondaryBtn];
    const secondaryActive = [buttonStyles, styles._secondaryActive];
    const secondaryTextStyles = [styles._text, styles._secondaryTextStyles];
    const secondaryTextActive = [styles._text, styles._secondaryTextActive];

    if (this.props.primary) {
      buttonType = (
        <TouchableHighlight
          activeOpacity={0.4}
          style={this.state.pressStatus ? buttonActive : buttonStyles}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          onPress={this.props.disabled ? undefined : this.props.onPress}
        >
          <BodyText style={textStyles}>{this.props.text}</BodyText>
        </TouchableHighlight>
      );
    } else {
      buttonType = (
        <TouchableHighlight
          activeOpacity={0.4}
          style={this.state.pressStatus ? secondaryActive : secondaryStyles}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          onPress={this.props.disabled ? undefined : this.props.onPress}
        >
          <BodyText style={this.state.pressStatus ? secondaryTextActive : secondaryTextStyles}>
            {this.props.text}
          </BodyText>
        </TouchableHighlight>
      );
    }

    if (this.props.disabled) {
      buttonStyles.push(styles._disabledButton);
      textStyles.push(styles._disabledText);
      secondaryStyles.push(styles._disabledSecondaryBorder);
      secondaryTextStyles.push(styles._disabledSecondaryText);
    }
    buttonStyles.push(this.props.style);
    textStyles.push(this.props.textStyle);

    return (
      <View>
        { buttonType }
      </View>
    );
  }
}

export default Button;
