import React from 'react';

import {
  View,
} from 'react-native';
import styles from '../../../styles/posture/postureTutorial';

const StepOne = props => <View key={props.key} style={styles.stepOne} />;

StepOne.propTypes = {
  key: React.PropTypes.number,
};

export default StepOne;
