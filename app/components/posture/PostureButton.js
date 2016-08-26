import React from 'react';
import {
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../../styles/posture/postureButton';

const PostureButton = (props) => (
  <TouchableOpacity style={styles.button} onPress={props.onPress}>
    <Text style={styles.buttonText}>
      {props.buttonText}
    </Text>
  </TouchableOpacity>
);

PostureButton.propTypes = {
  colorStyle: React.PropTypes.object,
  onPress: React.PropTypes.func,
  buttonText: React.PropTypes.string,
};

export default PostureButton;
