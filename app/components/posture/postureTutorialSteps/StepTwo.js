import React from 'react';

import {
  View,
} from 'react-native';
import styles from '../../../styles/posture/postureTutorial';

const StepTwo = props => (
  <View key={props.key} style={styles.stepTwo} />
);

StepTwo.propTypes = {
  key: React.PropTypes.number,
};

export default StepTwo;
