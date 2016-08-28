import React from 'react';
import {
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import postureRoutes from '../../routes/posture';
import styles from '../../styles/posture/postureDashboard';

const PostureDashboardButton = (props) => (
  <TouchableOpacity
    style={props.navStyle}
    onPress={() => props.navigator.push(postureRoutes.postureTutorial)}
  >
    <Icon
      name="question-circle-o"
      size={props.iconSize}
      color={styles._button.color}
    />
  </TouchableOpacity>
);

PostureDashboardButton.propTypes = {
  iconSize: React.PropTypes.number,
  navigator: React.PropTypes.object,
  currentRoute: React.PropTypes.object,
};

export default PostureDashboardButton;
