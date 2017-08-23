import React, { Component, PropTypes } from 'react';
import {
  Image,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import color from 'color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import appActions from '../actions/app';
import userActions from '../actions/user';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import bulletWhite from '../images/bullet-white.png';
import videoIconBlue from '../images/video-icon-blue.png';
import videoIconGreen from '../images/video-icon-green.png';
import videoIconOrange from '../images/video-icon-orange.png';
import videoIconPurple from '../images/video-icon-purple.png';
import videoIconRed from '../images/video-icon-red.png';
import { getColorHexForLevel, getColorNameForLevel } from '../utils/levelColors';
import styles from '../styles/guidedTraining';
import theme from '../styles/theme';
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

const videoIcon = {
  purple: videoIconPurple,
  blue: videoIconBlue,
  green: videoIconGreen,
  orange: videoIconOrange,
  red: videoIconRed,
};

/**
 * Converts seconds to a time string in H:MM:SS or M:SS format
 * @param {Number} totalSeconds
 */
const getFormattedTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  const seconds = totalSeconds % 60;

  const lpad = number => {
    if (number < 10) {
      return `0${number}`;
    }
    return number;
  };

  const timeArray = [];
  if (hours) {
    timeArray[0] = hours;
    timeArray[1] = lpad(minutes);
    timeArray[2] = lpad(seconds);
  } else {
    timeArray[0] = minutes;
    timeArray[1] = lpad(seconds);
  }
  return timeArray.join(':');
};

class GuidedTraining extends Component {
  static propTypes = {
    hidePartialModal: PropTypes.func.isRequired,
    levelIdx: PropTypes.number.isRequired,
    planId: PropTypes.string.isRequired,
    sessionIdx: PropTypes.number.isRequired,
    showPartialModal: PropTypes.func.isRequired,
    training: PropTypes.shape({
      errorMessage: PropTypes.string,
      isUpdating: PropTypes.bool,
    }).isRequired,
    updateUserTrainingPlanProgress: PropTypes.func.isRequired,
    user: PropTypes.shape({
      trainingPlanProgress: PropTypes.objectOf(
        PropTypes.arrayOf(
          PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.bool)
          )
        )
      ),
    }),
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
      ...this._getNewStateForWorkout(currentWorkout),
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

  componentWillReceiveProps(nextProps) {
    if (this.props.training.isUpdating && !nextProps.training.isUpdating) {
      if (nextProps.training.errorMessage) {
        this.props.showPartialModal({
          topView: (<Icon name="error-outline" size={40} color={theme.warningColor} />),
          title: { caption: 'Error' },
          detail: {
            caption: 'An unexpected error occurred while saving your progress. ' +
              'Please try again later.',
          },
          buttons: [{ caption: 'CLOSE' }],
          backButtonHandler: () => {
            this.props.hidePartialModal();
          },
        });
      } else {
        this.setState({
          currentWorkout: nextProps.workouts[this.state.step - 1],
        });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevState.currentWorkout, this.state.currentWorkout)) {
      // Workout changed
      // Prefetch workout gif
      Image.prefetch(this.state.currentWorkout.workout.gifUrl)
        .then(() => {
          this.setState({ isFetchingImage: false });
        })
        .catch(() => {
          // Suppress errors
          this.setState({ isFetchingImage: false });
        });
    }

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

  _getNewStateForWorkout(workout) {
    return {
      side: 1,
      currentWorkout: workout,
      hasWorkoutStarted: false,
      hasTimerStarted: false,
      timerSeconds: workout.seconds,
      isTimerRunning: false,
      setsRemaining: workout.sets,
      isFetchingImage: true,
      leftButtonDepressed: false,
      centerButtonDepressed: false,
      rightButtonDepressed: false,
    };
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
    switch (buttonName) {
      case 'leftButton': {
        const isFirstWorkout = this.state.step === 1;
        if (!isFirstWorkout) {
          // There is a previous workout in the session that can be navigated to
          this.setState(prevState => {
            const step = prevState.step - 1;
            return {
              step,
              ...this._getNewStateForWorkout(this.props.workouts[step - 1]),
            };
          });
        }
        break;
      }
      case 'centerButton': {
        const {
          currentWorkout,
          isTimerRunning,
          setsRemaining,
          step,
        } = this.state;
        const isTimed = !!currentWorkout.seconds;

        if (isTimerRunning) {
          // Pause timer
          this._pauseTimer();
        } else if (isTimed && setsRemaining > 0) {
          // Start/resume timer
          this._startTimer();
        } else if (!currentWorkout.isComplete) {
          // Mark workout as complete
          const {
            levelIdx,
            sessionIdx,
            planId,
            user,
          } = this.props;
          const progress = cloneDeep(user.trainingPlanProgress);
          const planProgress = progress[planId];

          // The plan progress array may not always contain the exact number of elements as
          // workouts in the training plan, so we need to fill missing elements up to the
          // current level and session indices with empty arrays.

          // Fill in missing levels
          for (let i = 0; i <= levelIdx; i++) {
            if (!planProgress[i]) {
              planProgress[i] = [];
            }
          }

          // Fill in missing sessions in the current level up to the current session
          for (let i = 0; i <= sessionIdx; i++) {
            if (!planProgress[levelIdx][i]) {
              planProgress[levelIdx][i] = [];
            }
          }

          // Mark the current workout as complete
          planProgress[levelIdx][sessionIdx][step - 1] = true;
          this.props.updateUserTrainingPlanProgress(progress);
        }
        break;
      }
      case 'rightButton': {
        const isLastWorkout = this.state.step === this.props.workouts.length;
        if (!isLastWorkout) {
          // There is a next workout in the session that can be navigated to
          this.setState(prevState => {
            const step = prevState.step + 1;
            return {
              step,
              ...this._getNewStateForWorkout(this.props.workouts[step - 1]),
            };
          });
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

    // If the workout is timed and has already started, the header will display the timer
    // along with the number of sets remaining. Otherwise, display the workout instructions.
    const header = isTimed && this.state.hasWorkoutStarted ? (
      <View style={styles.header}>
        <BodyText style={styles._timer}>{getFormattedTime(this.state.timerSeconds)}</BodyText>
        <BodyText>Sets Remaining: {this.state.setsRemaining}</BodyText>
        {currentWorkout.twoSides && this.state.setsRemaining > 0 &&
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

    const levelColorHex = getColorHexForLevel(this.props.levelIdx);
    const levelColorName = getColorNameForLevel(this.props.levelIdx);

    // The left button would be disabled if this is the first workout in the session
    const isLeftButtonDisabled = this.state.step === 1;
    const additionalLeftButtonStyles = {};
    if (isLeftButtonDisabled) {
      additionalLeftButtonStyles.opacity = 0.4;
    }

    // The right button would be disabled if this is the last workout in the session
    const isRightButtonDisabled = this.state.step === this.props.workouts.length;
    const additionalRightButtonStyles = {};
    if (isRightButtonDisabled) {
      additionalRightButtonStyles.opacity = 0.4;
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
          backgroundColor={levelColorHex}
        />
        {header}
        {this.state.isFetchingImage ? <Spinner size="large" color={levelColorHex} /> : (
          <Image source={{ uri: currentWorkout.workout.gifUrl }} style={styles.gif}>
            <TouchableOpacity
              style={styles.videoLink}
              onPress={() => { /* TODO: NAVIGATE TO WORKOUT VIDEO */ }}
            >
              <Image source={videoIcon[levelColorName]} style={styles.videoIcon} />
            </TouchableOpacity>
          </Image>
        )}
        <View style={styles.footer}>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={levelColorHex}
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
                  style={{ color: this.state.leftButtonDepressed ? 'white' : levelColorHex }}
                />
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles._footerButtonText}>PREVIOUS</SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={levelColorHex}
              onPress={() => this._onButtonPress('centerButton')}
              onShowUnderlay={() => this._onButtonShowUnderlay('centerButton')}
              onHideUnderlay={() => this._onButtonHideUnderlay('centerButton')}
              style={[styles.footerButton, {
                backgroundColor: currentWorkout.isComplete ? levelColorHex : 'white',
              }]}
            >
              <View style={styles.footerButtonIconContainer}>
                <Icon
                  name={centerButtonIconName}
                  size={applyWidthDifference(50)}
                  style={{
                    color: this.state.centerButtonDepressed || currentWorkout.isComplete ?
                      'white' : levelColorHex,
                  }}
                />
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles._footerButtonText}>{centerButtonIconLabel}</SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={levelColorHex}
              onPress={() => this._onButtonPress('rightButton')}
              onShowUnderlay={() => this._onButtonShowUnderlay('rightButton')}
              onHideUnderlay={() => this._onButtonHideUnderlay('rightButton')}
              style={[styles.footerButton, additionalRightButtonStyles]}
              disabled={isRightButtonDisabled}
            >
              <View style={styles.footerButtonIconContainer}>
                <Icon
                  name="arrow-forward"
                  size={applyWidthDifference(50)}
                  style={{ color: this.state.rightButtonDepressed ? 'white' : levelColorHex }}
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

const mapStateToProps = ({ training, user }) => ({
  training,
  user: user.user,
});

export default connect(mapStateToProps, {
  ...appActions,
  ...userActions,
})(GuidedTraining);
