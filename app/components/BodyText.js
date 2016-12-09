import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles/text';
import reusableDefaults from './utils/reusableDefaults';

const { propTypes, defaultProps, fontScalingProps: { allowFontScaling } } = reusableDefaults;

class BodyText extends React.Component {
  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  render() {
    const {
      style,
      ...remainingProps,
    } = this.props;

    remainingProps.allowFontScaling = allowFontScaling;

    return (
      <View ref={component => { this._root = component; }}>
        <Text
          style={[styles._body, style]}
          {...remainingProps}
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
