import React, { Component, PropTypes } from 'react';
import { View, Image } from 'react-native';
import { connect } from 'react-redux';
import color from 'color';
import BodyText from '../components/BodyText';
import bulletWhite from '../images/bullet-white.png';
import { getColorHexForLevel } from '../utils/levelColors';
import styles from '../styles/guidedTraining';

const ProgressBar = (props) => {
  const stepIndicators = [];
  for (let step = 0; step < props.totalSteps; step++) {
    stepIndicators.push(
      <Image
        key={step}
        source={bulletWhite}
        style={[styles.stepIndicator, {
          opacity: step < props.currentStep ? 1 : 0.5,
        }]}
      />
    );
  }

  const progress = (props.currentStep / props.totalSteps) * 100;

  return (
    <View
      style={[styles.progressBarOuter, {
        backgroundColor: color(props.backgroundColor).clearer(0.6).rgbaString(),
      }]}
    >
      <View
        style={[styles.progressBarInner, {
          backgroundColor: props.backgroundColor,
          width: `${progress}%`,
        }]}
      />
      <View style={styles.progressBarStepIndicators}>
        {stepIndicators}
      </View>
    </View>
  );
};

ProgressBar.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
  backgroundColor: PropTypes.string,
};

class GuidedTraining extends Component {
  static propTypes = {
    levelIdx: PropTypes.number.isRequired,
    workouts: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      instructions: PropTypes.string,
      workout: PropTypes.object,
      isComplete: PropTypes.bool,
    })).isRequired,
  };

  constructor(props) {
    super(props);

    // Find the first incomplete workout index
    let step = props.workouts.findIndex(workout => !workout.isComplete);
    if (step === -1) {
      step = props.workouts.length - 1;
    }

    this.state = {
      step: step + 1,
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <ProgressBar
          currentStep={this.state.step}
          totalSteps={this.props.workouts.length}
          backgroundColor={getColorHexForLevel(this.props.levelIdx)}
        />
        <BodyText>Total workouts: {this.props.workouts.length}</BodyText>
      </View>
    );
  }
}

export default connect()(GuidedTraining);
