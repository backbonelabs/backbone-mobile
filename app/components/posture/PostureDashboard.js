import React from 'react';
import {
  View,
} from 'react-native';
import postureRoutes from '../../routes/posture';
import styles from '../../styles/posture/postureDashboard';

import PostureButton from './PostureButton';

const PostureDashboard = (props) => (
  <View style={styles.container}>
    <View style={styles.analyticsContainer} />
    <View style={styles.buttonContainer}>
      <PostureButton
        text="Next"
        onPress={() => props.navigator.push(postureRoutes.postureCalibrate)}
        styleColor={styles._button.color}
      />
    </View>
  </View>
);

PostureDashboard.propTypes = {
  navigator: React.PropTypes.object,
};


export default PostureDashboard;
