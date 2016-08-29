import React from 'react';
import {
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../../styles/posture/postureButton';

const PostureButton = (props) => (
  <TouchableOpacity style={styles.button} onPress={props.onPressHandler}>
    <Text style={styles.text}>
      {props.text}
    </Text>
  </TouchableOpacity>
);

PostureButton.propTypes = {
  onPressHandler: React.PropTypes.func,
  text: React.PropTypes.string,
};

export default PostureButton;
