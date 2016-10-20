import React from 'react';

import {
  View,
} from 'react-native';
import styles from '../../styles/posture/postureTutorial';

const Device = props => <View key={props.key} style={styles.stepOne} />;

const { PropTypes } = React;

Device.propTypes = {
  key: PropTypes.number,
};

export default Device;
