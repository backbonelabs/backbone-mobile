import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableHighlight,
  Platform,
} from 'react-native';
import autobind from 'class-autobind';
import BodyText from './BodyText';
import styles from '../styles/button';

const buttonShadow = {
  ...Platform.select({
      // OS-specific drop shadow styling
    ios: {
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 2,
      shadowOpacity: 0.3,
    },
    android: {
      elevation: 1,
    },
  }),
};

class Button extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    style: View.propTypes.style,
    underlayColor: PropTypes.string,
    text: PropTypes.string.isRequired,
    textStyle: View.propTypes.style,
    primary: PropTypes.bool,
    secondary: PropTypes.bool,
    fbBtn: PropTypes.bool,
    pressStatus: PropTypes.bool,
    shadow: PropTypes.bool,
    onHideUnderlay: PropTypes.func,
    onShowUnderlay: PropTypes.func,
  };

  static defaultProps = {
    style: {},
    textStyle: {},
    shadow: true,
  };

  constructor(props) {
    super(props);
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
    let buttonType;
    const textStyles = [styles._text];
    const buttonStyles = [styles.button];
    const secondaryStyles = [buttonStyles, styles.secondaryBtn];
    const fbBtnStyles = [buttonStyles, styles.facebookBtn];
    const defaultStyles = [buttonStyles, styles.defaultBtn];
    const defaultActive = [buttonStyles, styles.defaultActive];
    const defaultTextActive = [styles._text, styles._defaultTextActive];
    const defaultTextStyles = [styles._text, styles._defaultTextStyles];

    if (this.props.primary) {
      buttonType = (
        <TouchableHighlight
          style={buttonStyles}
          underlayColor={this.props.underlayColor ? this.props.underlayColor : '#FB8C00'}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          onPress={this.props.disabled ? undefined : this.props.onPress}
        >
          <View>
            <BodyText style={textStyles}>{this.props.text}</BodyText>
          </View>
        </TouchableHighlight>
      );
    } else if (this.props.fbBtn) {
      buttonType = (
        <TouchableHighlight
          activeOpacity={0.4}
          style={fbBtnStyles}
          underlayColor={'#8b9dc3'}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          onPress={this.props.disabled ? undefined : this.props.onPress}
        >
          <View>
            <BodyText style={textStyles}>{this.props.text}</BodyText>
          </View>
        </TouchableHighlight>
      );
    } else if (this.props.secondary) {
      buttonType = (
        <TouchableHighlight
          style={secondaryStyles}
          underlayColor={'#0091EA'}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          onPress={this.props.disabled ? undefined : this.props.onPress}
        >
          <View>
            <BodyText style={textStyles}>{this.props.text}</BodyText>
          </View>
        </TouchableHighlight>
      );
    } else {
      buttonType = (
        <TouchableHighlight
          activeOpacity={0.4}
          style={this.state.pressStatus ? defaultActive : defaultStyles}
          underlayColor={'transparent'}
          onHideUnderlay={this._onHideUnderlay}
          onShowUnderlay={this._onShowUnderlay}
          onPress={this.props.disabled ? undefined : this.props.onPress}
        >
          <View>
            <BodyText style={this.state.pressStatus ? defaultTextActive : defaultTextStyles}>
              {this.props.text}
            </BodyText>
          </View>
        </TouchableHighlight>
      );
    }

    if (this.props.shadow) {
      buttonStyles.push(buttonShadow);
    }

    if (this.props.disabled) {
      buttonStyles.push(styles.disabledButton);
      textStyles.push(styles._disabledText);
      defaultStyles.push(styles.disabledSecondaryBorder);
      defaultTextStyles.push(styles._disabledSecondaryText);
    }
    buttonStyles.push(this.props.style);
    textStyles.push(this.props.textStyle);
    fbBtnStyles.push(this.props.style);
    secondaryStyles.push(this.props.style);

    return buttonType;
  }
}

export default Button;
