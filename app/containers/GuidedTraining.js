import React, { Component, PropTypes } from 'react';
import { View, Image } from 'react-native';
import { connect } from 'react-redux';
import color from 'color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
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
      reps: PropTypes.number,
      sets: PropTypes.number,
      seconds: PropTypes.number,
      twoSides: PropTypes.bool,
      additionalDetails: PropTypes.string,
      isComplete: PropTypes.bool,
      workout: PropTypes.object,
    })).isRequired,
  };

  constructor(props) {
    super(props);

    // Find the first incomplete workout index
    let stepIdx = props.workouts.findIndex(workout => !workout.isComplete);
    if (stepIdx === -1) {
      stepIdx = props.workouts.length - 1;
    }

    this.state = {
      step: stepIdx + 1,
      hasTimerStarted: false,
      isFetchingImage: true,
    };
  }

  componentDidMount() {
    // Fetch image in the background. User should see a Spinner until the image is fully fetched.
    Image.prefetch(this.props.workouts[this.state.step - 1].workout.gifUrl)
      .then(() => {
        this.setState({ isFetchingImage: false });
      })
      .catch(() => {
        // Suppress errors
        this.setState({ isFetchingImage: false });
      });
  }

  render() {
    const currentWorkout = this.props.workouts[this.state.step - 1];
    const subheading = [];
    if (currentWorkout.reps) {
      subheading.push(`Reps: ${currentWorkout.reps}`);
    } else if (currentWorkout.seconds) {
      subheading.push(`Time: ${currentWorkout.seconds}`);
    }

    if (currentWorkout.sets) {
      subheading.push(`Sets: ${currentWorkout.sets}`);
    }

    if (currentWorkout.twoSides) {
      subheading[0] += '/side';
    }

    const header = currentWorkout.seconds && this.state.hasTimerStarted ? (
      <View style={styles.header}>
        <BodyText style={styles._timer}>0:30</BodyText>
        <BodyText>Time Remaining</BodyText>
      </View>
    ) : (
      <View style={styles.header}>
        <HeadingText size={1}>{currentWorkout.workout.title}</HeadingText>
        <BodyText style={styles._subheading}>{subheading.join('\n')}</BodyText>
        <BodyText style={styles._instructions}>{currentWorkout.workout.instructions}</BodyText>
      </View>
    );

    const levelColor = getColorHexForLevel(this.props.levelIdx);

    return (
      <View style={styles.container}>
        <ProgressBar
          currentStep={this.state.step}
          totalSteps={this.props.workouts.length}
          backgroundColor={levelColor}
        />
        {header}
        {this.state.isFetchingImage ? <Spinner size="large" color={levelColor} /> :
          <Image source={{ uri: currentWorkout.workout.gifUrl }} style={styles.gif} />}
        <View style={styles.footer}>
          <View style={styles.footerButtonContainer}>
            <View style={styles.footerButton}>
              <Icon name="arrow-back" size={60} />
            </View>
            <SecondaryText style={{ textAlign: 'center' }}>PREVIOUS</SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <View style={styles.footerButton}>
              <Icon name="check" size={60} />
            </View>
            <SecondaryText style={{ textAlign: 'center' }}>DONE</SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <View style={styles.footerButton}>
              <Icon name="arrow-forward" size={60} />
            </View>
            <SecondaryText style={{ textAlign: 'center' }}>NEXT</SecondaryText>
          </View>
        </View>
      </View>
    );
  }
}

export default connect()(GuidedTraining);
