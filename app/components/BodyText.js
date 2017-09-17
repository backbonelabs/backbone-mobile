import React from 'react';
import {
  View,
} from 'react-native';
import UnscalableText from './UnscalableText';
import styles from '../styles/text';

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
        <UnscalableText
          style={[styles.body, style]}
          {...remainingProps}
        >
          {this.props.children}
        </UnscalableText>
      </View>
    );
  }
}

BodyText.propTypes = UnscalableText.propTypes;

export default BodyText;
