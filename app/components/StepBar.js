import React, { PropTypes } from 'react';
import { View } from 'react-native';
import styles from '../styles/stepBar.js';

const StepBar = ({ step, style }) => {
  const steps = [
    { outerCircle: 'transparent', innerCircle: '#9E9E9E' },
    { outerCircle: 'transparent', innerCircle: '#9E9E9E' },
    { outerCircle: 'transparent', innerCircle: '#9E9E9E' },
    { outerCircle: 'transparent', innerCircle: '#9E9E9E' },
  ];

  const currentSteps = steps.map((val, idx) => {
    if (idx < step) {
      const copy = {};
      copy.outerCircle = val.outerCircle;
      copy.innerCircle = '#FF9800';
      if ((step - idx) === 1) {
        copy.outerCircle = '#FF9800';
      }
      return copy;
    }
    return val;
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.outerCircle, { borderColor: currentSteps[0].outerCircle }]}>
        <View style={[styles.innerCircle, { backgroundColor: currentSteps[0].innerCircle }]} />
      </View>
      <View style={[styles.line, { backgroundColor: currentSteps[1].innerCircle }]} />
      <View style={[styles.outerCircle, { borderColor: currentSteps[1].outerCircle }]}>
        <View style={[styles.innerCircle, { backgroundColor: currentSteps[1].innerCircle }]} />
      </View>
      <View style={[styles.line, { backgroundColor: currentSteps[2].innerCircle }]} />
      <View style={[styles.outerCircle, { borderColor: currentSteps[2].outerCircle }]}>
        <View style={[styles.innerCircle, { backgroundColor: currentSteps[2].innerCircle }]} />
      </View>
      <View style={[styles.line, { backgroundColor: currentSteps[3].innerCircle }]} />
      <View style={[styles.outerCircle, { borderColor: currentSteps[3].outerCircle }]}>
        <View style={[styles.innerCircle, { backgroundColor: currentSteps[3].innerCircle }]} />
      </View>
    </View>
    );
};

StepBar.propTypes = {
  step: PropTypes.number,
  style: View.propTypes.style,
};

export default StepBar;
