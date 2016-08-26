import React from 'react';
import {
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../styles/postureButton';

const PostureButtonView = (props) => (
  <TouchableOpacity style={styles.button} onPress={props.onPress}>
    <Text style={styles.buttonText}>
      {props.buttonText}
    </Text>
  </TouchableOpacity>
);

PostureButtonView.propTypes = {
  colorStyle: React.PropTypes.object,
  onPress: React.PropTypes.func,
  buttonText: React.PropTypes.string,
};

export default PostureButtonView;
