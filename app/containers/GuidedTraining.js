import React, { Component, PropTypes } from 'react';
import { View, Image, TouchableHighlight } from 'react-native';
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
import relativeDimensions from '../utils/relativeDimensions';
import { formattedTimeString } from '../utils/timeUtils';

const { applyWidthDifference } = relativeDimensions;

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

    const currentWorkout = props.workouts[stepIdx];

    this.state = {
      step: stepIdx + 1,
      side: 1,
      currentWorkout,
      hasWorkoutStarted: false,
      hasTimerStarted: false,
      timerSeconds: currentWorkout.seconds,
      isTimerRunning: false,
      setsRemaining: currentWorkout.sets,
      isFetchingImage: true,
      leftButtonDepressed: false,
      centerButtonDepressed: false,
      rightButtonDepressed: false,
    };

    this.timerInterval = null;
  }

  componentDidMount() {
    // Fetch image in the background. User should see a Spinner until the image is fully fetched.
    Image.prefetch(this.state.currentWorkout.workout.gifUrl)
      .then(() => {
        this.setState({ isFetchingImage: false });
      })
      .catch(() => {
        // Suppress errors
        this.setState({ isFetchingImage: false });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.timerSeconds !== this.state.timerSeconds && this.state.timerSeconds === 0) {
      // Timer reached 0 for the rep, stop the timer
      this._pauseTimer(() => {
        if (this.state.setsRemaining > 0) {
          // Perform checks to see if there are more sets to do or if user needs to switch sides
          const { currentWorkout } = this.state;
          const newState = {};
          if (currentWorkout.twoSides && prevState.side === this.state.side) {
            // This workout needs to be done on two sides
            if (this.state.side === 1) {
              // User did it on the first side, now switch to the second side
              newState.side = 2;
            } else {
              // User did it on the second side, now reset to first side and decrement set count
              newState.side = 1;
              newState.setsRemaining = this.state.setsRemaining - 1;
            }
          } else if (!currentWorkout.twoSides) {
            // This workout does not need to be done on two sides, decrement set count
            newState.setsRemaining = this.state.setsRemaining - 1;
          }

          if (newState.side === 2 || newState.setsRemaining) {
            // There are no more sets or another side to do, reset timer
            newState.timerSeconds = currentWorkout.seconds;
            newState.hasTimerStarted = false;
          }

          // eslint-disable-next-line react/no-did-update-set-state
          this.setState(newState);
        }
      });
    }
  }

  _startTimer() {
    this.setState({
      hasWorkoutStarted: true,
      hasTimerStarted: true,
      isTimerRunning: true,
    }, () => {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      this.timerInterval = setInterval(() => {
        this.setState(prevState => ({ timerSeconds: prevState.timerSeconds - 1 }));
      }, 1000);
    });
  }

  _pauseTimer(cb) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.setState({ isTimerRunning: false }, cb);
  }

  _onButtonPress(buttonName) {
    // TODO: Perform appropriate actions for button presses
    switch (buttonName) {
      case 'centerButton': {
        const { currentWorkout } = this.state;
        const isTimed = !!currentWorkout.seconds;

        if (this.state.isTimerRunning) {
          // Pause timer
          this._pauseTimer();
        } else if (isTimed && this.state.setsRemaining > 0) {
          // Start/resume timer
          this._startTimer();
        } else {
          // Mark as complete
        }
        break;
      }
      default:
        // no-op
    }
  }

  _onButtonShowUnderlay(buttonName) {
    this.setState({ [`${buttonName}Depressed`]: true });
  }

  _onButtonHideUnderlay(buttonName) {
    this.setState({ [`${buttonName}Depressed`]: false });
  }

  render() {
    const { currentWorkout } = this.state;
    const isTimed = !!currentWorkout.seconds;

    const subheading = [];
    if (currentWorkout.reps) {
      subheading.push(`Reps: ${currentWorkout.reps}`);
    } else if (currentWorkout.seconds) {
      subheading.push(`Time: ${formattedTimeString(currentWorkout.seconds)}`);
    }

    if (currentWorkout.sets) {
      subheading.push(`Sets: ${currentWorkout.sets}`);
    }

    if (currentWorkout.twoSides) {
      subheading[0] += '/side';
    }

    const header = isTimed && this.state.hasWorkoutStarted ? (
      <View style={styles.header}>
        <BodyText style={styles._timer}>{this.state.timerSeconds}</BodyText>
        <BodyText>Sets Remaining: {this.state.setsRemaining}</BodyText>
        {currentWorkout.twoSides &&
          <View style={styles.twoSidedText}>
            <BodyText>Perform with your</BodyText>
            <BodyText style={styles._strongText}>
              {this.state.side === 1 ? ' first ' : ' second '}
            </BodyText>
            <BodyText>side.</BodyText>
          </View>}
      </View>
    ) : (
      <View style={styles.header}>
        <HeadingText size={1}>{currentWorkout.workout.title}</HeadingText>
        <BodyText style={styles._subheading}>{subheading.join('\n')}</BodyText>
        <BodyText style={styles._instructions}>{currentWorkout.workout.instructions}</BodyText>
      </View>
    );

    const levelColor = getColorHexForLevel(this.props.levelIdx);

    const isLeftButtonDisabled = this.state.step === 1;
    const additionalLeftButtonStyles = {};
    if (isLeftButtonDisabled) {
      additionalLeftButtonStyles.opacity = 0.4;
    }

    let centerButtonIconName;
    let centerButtonIconLabel;
    if (this.state.isTimerRunning) {
      centerButtonIconName = 'pause';
      centerButtonIconLabel = 'PAUSE';
    } else if (this.state.timerSeconds !== 0 && isTimed) {
      centerButtonIconName = 'play-arrow';
      if (this.state.hasTimerStarted) {
        centerButtonIconLabel = 'RESUME';
      } else {
        centerButtonIconLabel = 'START';
      }
    } else {
      centerButtonIconName = 'check';
      centerButtonIconLabel = 'DONE';
    }

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
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={levelColor}
              onPress={() => this._onButtonPress('leftButton')}
              onShowUnderlay={() => this._onButtonShowUnderlay('leftButton')}
              onHideUnderlay={() => this._onButtonHideUnderlay('leftButton')}
              style={[styles.footerButton, additionalLeftButtonStyles]}
              disabled={isLeftButtonDisabled}
            >
              <View style={styles.footerButtonIconContainer}>
                <Icon
                  name="arrow-back"
                  size={applyWidthDifference(50)}
                  style={{ color: this.state.leftButtonDepressed ? 'white' : levelColor }}
                />
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles._footerButtonText}>PREVIOUS</SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={levelColor}
              onPress={() => this._onButtonPress('centerButton')}
              onShowUnderlay={() => this._onButtonShowUnderlay('centerButton')}
              onHideUnderlay={() => this._onButtonHideUnderlay('centerButton')}
              style={styles.footerButton}
            >
              <View style={styles.footerButtonIconContainer}>
                <Icon
                  name={centerButtonIconName}
                  size={applyWidthDifference(50)}
                  style={{ color: this.state.centerButtonDepressed ? 'white' : levelColor }}
                />
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles._footerButtonText}>{centerButtonIconLabel}</SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={levelColor}
              onPress={() => this._onButtonPress('rightButton')}
              onShowUnderlay={() => this._onButtonShowUnderlay('rightButton')}
              onHideUnderlay={() => this._onButtonHideUnderlay('rightButton')}
              style={styles.footerButton}
            >
              <View style={styles.footerButtonIconContainer}>
                <Icon
                  name="arrow-forward"
                  size={applyWidthDifference(50)}
                  style={{ color: this.state.rightButtonDepressed ? 'white' : levelColor }}
                />
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles._footerButtonText}>NEXT</SecondaryText>
          </View>
        </View>
      </View>
    );
  }
}

export default connect()(GuidedTraining);
