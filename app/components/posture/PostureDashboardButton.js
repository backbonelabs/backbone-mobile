import React from 'react';
import {
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import postureRoutes from '../../routes/posture';
import styles from '../../styles/posture/postureDashboard';

const PostureDashboardButton = (props) => {
  console.log('props ', props);
  return (
    <TouchableOpacity
      style={props.navStyle}
      onPress={() => props.navigator.push(postureRoutes.postureTutorial)}
    >
      <Icon
        name="question-circle-o"
        size={props.iconSize}
        color={styles._button.color}
      />
    </TouchableOpacity>)
};

PostureDashboardButton.propTypes = {
  navigator: React.PropTypes.object,
  currentRoute: React.PropTypes.object,
};

export default PostureDashboardButton;
