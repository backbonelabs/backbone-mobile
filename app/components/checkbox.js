import React, { Component, PropTypes } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/checkbox';

class BBCheckbox extends Component {
  static propTypes = {
    checked: PropTypes.bool,
    onCheckedChange: PropTypes.func,
    style: PropTypes.object,
    iconSize: PropTypes.number,
    iconColor: PropTypes.string,
  };

  static defaultProps = {
    iconSize: 18,
    iconColor: 'white',
  };

  constructor() {
    super();
    this.state = {
      checked: false,
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.initView(this.props.checked);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== this.props.checked) {
      this.initView(nextProps.checked);
    }
  }

  initView(checked) {
    this.setState({ checked });
  }

  toggle() {
    this.setState({ checked: !this.state.checked }, () => {
      if (this.props.onCheckedChange) {
        this.props.onCheckedChange({ checked: this.state.checked });
      }
    });
  }

  render() {
    const { checked } = this.state;
    const { style, iconSize, iconColor, ...remainingProps } = this.props;
    const boxStyles = [style, styles.checkbox];
    if (checked) {
      boxStyles.push({ backgroundColor: '#FF9800', borderColor: '#FF9800' });
    }
    return (
      <TouchableWithoutFeedback onPress={this.toggle} {...remainingProps}>
        <View style={boxStyles}>
          {this.state.checked
            ? <Icon name="check" size={iconSize} color={iconColor} />
            : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default BBCheckbox;
