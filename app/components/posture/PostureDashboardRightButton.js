import React from 'react';
import {
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import postureRoutes from '../../routes/posture';
import styles from '../../styles/posture/postureDashboard';

const PostureDashboardRightButton = (props) => (
  <TouchableOpacity
    style={props.navStyle}
    onPress={() => props.navigator.push(postureRoutes.postureTutorial)}
  >
    <Icon
      name="question-circle-o"
      size={props.iconSize}
      color={styles._rightButton.color}
    />
  </TouchableOpacity>
);

PostureDashboardRightButton.propTypes = {
  iconSize: React.PropTypes.number,
  navigator: React.PropTypes.object,
  currentRoute: React.PropTypes.object,
};

export default PostureDashboardRightButton;
