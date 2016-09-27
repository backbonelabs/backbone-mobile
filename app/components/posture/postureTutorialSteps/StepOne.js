import React from 'react';

import {
  View,
} from 'react-native';
import styles from '../../../styles/posture/postureTutorial';

const StepOne = props => <View key={props.key} style={styles.stepOne} />;

const { PropTypes } = React;

StepOne.propTypes = {
  key: PropTypes.number,
};

export default StepOne;
