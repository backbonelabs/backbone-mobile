import React from 'react';
import {
  View,
} from 'react-native';
import Button from '../Button';
import routes from '../../routes';
import styles from '../../styles/posture/postureDashboard';

const PostureDashboard = props => (
  <View style={styles.container}>
    <View style={styles.analyticsContainer} />
    <View style={styles.buttonContainer}>
      <Button
        text="Start"
        onPress={() => props.navigator.push(routes.postureCalibrate)}
      />
    </View>
  </View>
);

PostureDashboard.propTypes = {
  navigator: React.PropTypes.object,
};


export default PostureDashboard;
