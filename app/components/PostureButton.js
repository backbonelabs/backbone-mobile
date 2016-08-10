import React from 'react';
import {
  TouchableHighlight,
  Text,
} from 'react-native';
import styles from '../styles/postureButton';

const PostureButtonView = (props) => (
  <TouchableHighlight style={[styles.button, props.colorStyle]} onPress={props.onPress}>
    <Text style={styles.buttonText}>
      {props.buttonText}
    </Text>
  </TouchableHighlight>
);

PostureButtonView.propTypes = {
  colorStyle: React.PropTypes.object,
  onPress: React.PropTypes.func,
  buttonText: React.PropTypes.string,
};

export default PostureButtonView;
