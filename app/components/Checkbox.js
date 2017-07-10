import React, { Component, PropTypes } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/checkbox';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

class Checkbox extends Component {
  static propTypes = {
    checked: PropTypes.bool,
    onCheckedChange: PropTypes.func,
    style: PropTypes.object,
    iconSize: PropTypes.number,
    iconColor: PropTypes.string,
  };

  static defaultProps = {
    iconSize: applyWidthDifference(18),
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
    this.setState((prevState) => ({
      checked: !prevState.checked,
    }), () => {
      if (this.props.onCheckedChange) {
        this.props.onCheckedChange({ checked: this.state.checked });
      }
    });
  }

  render() {
    const { checked } = this.state;
    const { style, iconSize, iconColor, ...remainingProps } = this.props;
    const boxStyles = [styles.checkbox, style];
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

export default Checkbox;
