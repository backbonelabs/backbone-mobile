import React from 'react';

import {
  View,
} from 'react-native';
import styles from '../../styles/posture/postureTutorial';

const Profile = props => <View key={props.key} style={styles.stepOne} />;

const { PropTypes } = React;

Profile.propTypes = {
  key: PropTypes.number,
};

export default Profile;
