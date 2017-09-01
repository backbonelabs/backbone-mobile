import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles/text';
import reusableTextDefaults from './utils/reusableTextDefaults';

const { propTypes, defaultProps, fontScalingProps: { allowFontScaling } } = reusableTextDefaults;

class BodyText extends React.Component {
  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  render() {
    const {
      style,
      ...remainingProps,
    } = this.props;

    return (
      <View ref={component => { this._root = component; }}>
        <Text
          style={[styles._body, style]}
          {...{ remainingProps, allowFontScaling }}
        >
          {this.props.children}
        </Text>
      </View>
    );
  }
}

BodyText.propTypes = propTypes;
BodyText.defaultProps = defaultProps;

export default BodyText;
