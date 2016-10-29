import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles/text';
import reusableDefaults from './utils/reusableDefaults';

class BodyText extends React.Component {

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  render() {
    return (
      <View ref={component => { this._root = component; }}>
        <Text style={[styles._body, this.props.style]}>
          {this.props.children}
        </Text>
      </View>
    );
  }
}

BodyText.propTypes = reusableDefaults.propTypes;
BodyText.defaultProps = reusableDefaults.defaultProps;

export default BodyText;
