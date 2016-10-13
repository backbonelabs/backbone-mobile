import React from 'react';

import {
  View,
} from 'react-native';
import styles from '../../../styles/posture/postureTutorial';

const StepThree = props => <View key={props.key} style={styles.stepThree} />;

const { PropTypes } = React;

StepThree.propTypes = {
  key: PropTypes.number,
};

export default StepThree;
