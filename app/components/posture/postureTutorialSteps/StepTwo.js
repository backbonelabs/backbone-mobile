import React from 'react';

import {
  View,
} from 'react-native';
import styles from '../../../styles/posture/postureTutorial';

const StepTwo = props => <View key={props.key} style={styles.stepTwo} />;

const { PropTypes } = React;

StepTwo.propTypes = {
  key: PropTypes.number,
};

export default StepTwo;
