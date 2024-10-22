import React, { Component, PropTypes } from 'react';
import {
  Image,
  TouchableHighlight,
  View,
  NativeModules,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import get from 'lodash/get';
import omit from 'lodash/omit';
import color from 'color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WorkoutView from './WorkoutView';
import appActions from '../actions/app';
import userActions from '../actions/user';
import trainingActions from '../actions/training';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import bulletWhite from '../images/bullet-white.png';
import styles from '../styles/guidedTraining';
import theme from '../styles/theme';
import relativeDimensions from '../utils/relativeDimensions';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import SensitiveInfo from '../utils/SensitiveInfo';
import { formattedTimeString } from '../utils/timeUtils';
import { markSessionStepComplete, isTrainingPlanComplete } from '../utils/trainingUtils';

const { storageKeys, workoutTypes } = constants;
const { KeepAwake } = NativeModules;
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
    showPartialModal: PropTypes.func.isRequired,
    navigator: PropTypes.shape({
      pop: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
    }).isRequired,
    training: PropTypes.shape({
      errorMessage: PropTypes.string,
      isUpdating: PropTypes.bool,
      plans: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,
          levels: PropTypes.arrayOf(
            PropTypes.arrayOf(
              PropTypes.arrayOf(
                PropTypes.shape({
                  title: PropTypes.string,
                  reps: PropTypes.number,
                  sets: PropTypes.number,
                  seconds: PropTypes.number,
                  twoSides: PropTypes.bool,
                  additionalDetails: PropTypes.string,
                  isComplete: PropTypes.bool,
                  workout: PropTypes.object,
                })
              )
            )
          ),
        })
      ),
      selectedPlanIdx: PropTypes.number,
      selectedLevelIdx: PropTypes.number,
      selectedSessionIdx: PropTypes.number,
      selectedStepIdx: PropTypes.number,
    }).isRequired,
    updateUserTrainingPlanProgress: PropTypes.func.isRequired,
    selectSessionStep: PropTypes.func.isRequired,
    user: PropTypes.shape({
      trainingPlanProgress: PropTypes.objectOf(
        PropTypes.arrayOf(
          PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.bool)
          )
        )
      ),
    }),
  };

  constructor(props) {
    super(props);
    autobind(this);
    const sessionWorkouts = this._getSessionWorkouts(props.training);

    // Find the first incomplete workout index
    let stepIdx = sessionWorkouts.findIndex(workout => !workout.isComplete);

    if (stepIdx === -1) {
      stepIdx = sessionWorkouts.length - 1;
    }

    const currentWorkout = this._getWorkoutFromCurrentSession(stepIdx, props.training);

    this.state = {
      stepIdx,
      ...this._getNewStateForWorkout(currentWorkout),
    };

    this.timerInterval = null;
  }

  componentDidMount() {
    // Auto-select the initial step index
    this.props.selectSessionStep(this.state.stepIdx);

    // Continue current step from where last left off if previously started but didn't finish
    SensitiveInfo.getItem(storageKeys.GUIDED_TRAINING_PENDING_PROGRESS)
      .then((pendingProgress = {}) => {
        const {
          selectedPlanIdx,
          selectedLevelIdx,
          selectedSessionIdx,
        } = this.props.training;
        const prevProgress = get(pendingProgress,
          `${selectedPlanIdx}.${selectedLevelIdx}.${selectedSessionIdx}.${this.state.stepIdx}`);

        if (prevProgress) {
          // The current step was previously started but didn't completely finish.
          // Update state with the correct side and setsRemaining based on previous progress.
          this.setState({ ...prevProgress });
        }
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
        // Update state with the latest data blob of the current workout, e.g., when
        // the workout is marked complete, we'll want the component state to see
        // that the current workout's isComplete flag is true so the appropriate
        // UI can be shown.
        this.setState({
          currentWorkout:
            this._getWorkoutFromCurrentSession(this.state.stepIdx, nextProps.training),
        });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.timerSeconds !== this.state.timerSeconds && this.state.timerSeconds === 0) {
      // Timer reached 0 for the rep, stop the timer
      this._pauseTimer(() => {
        // Perform checks to see if there are more sets to do or if user needs to switch sides
        const { setsRemaining, side } = this.state;
        if (setsRemaining > 0) {
          // At least one incomplete set remains
          const { currentWorkout } = this.state;
          const newState = {};
          if (currentWorkout.twoSides && prevState.side === side) {
            // User needs to switch sides
            if (side === 1) {
              // User did it on the first side, now switch to the second side
              newState.side = 2;
            } else {
              // User did it on the second side, now reset to first side and decrement set count
              newState.side = 1;
              newState.setsRemaining = setsRemaining - 1;
            }
          } else if (!currentWorkout.twoSides) {
            // This workout does not need to be done on two sides, decrement set count
            newState.setsRemaining = setsRemaining - 1;
          }

          // Save current status locally after completing the side or set
          const {
            selectedPlanIdx: planIdx,
            selectedLevelIdx: levelIdx,
            selectedSessionIdx: sessionIdx,
            selectedStepIdx: stepIdx,
          } = this.props.training;
          SensitiveInfo.getItem(storageKeys.GUIDED_TRAINING_PENDING_PROGRESS)
            .then((pendingProgress = {}) => {
              SensitiveInfo.setItem(storageKeys.GUIDED_TRAINING_PENDING_PROGRESS, {
                ...pendingProgress,
                [`${planIdx}.${levelIdx}.${sessionIdx}.${stepIdx}`]: {
                  side: get(newState, 'side', side),
                  setsRemaining: get(newState, 'setsRemaining', setsRemaining),
                },
              });
            });

          if (newState.side === 2 || newState.setsRemaining) {
            // There are more sets or another side to do, reset timer
            newState.timerSeconds = currentWorkout.seconds;
            newState.hasTimerStarted = false;
          }

          // It should be okay to call setState here since we would only get here only
          // after the timer reaches 0 once, so there shouldn't be an infinite loop of
          // setting state.
          // eslint-disable-next-line react/no-did-update-set-state
          this.setState(newState);
        }
      });
    }

    if (prevState.setsRemaining !== this.state.setsRemaining && this.state.setsRemaining === 0) {
      // Sets remaining got decremented and there are no more sets remaining.
      // This means the workout should be marked complete.
      this._markComplete();
    }
  }

  componentWillUnmount() {
    KeepAwake.deactivate();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  _getCurrentWorkoutState() {
    const {
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
    } = this.props.training;

    return {
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx: this.state.stepIdx,
    };
  }

  /**
   * Marks the current workout as complete
   */
  _markComplete() {
    // Update training plan progress in user profile
    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
      selectedStepIdx,
    } = this.props.training;
    let progress = this.props.user.trainingPlanProgress;
    progress = markSessionStepComplete(plans, selectedPlanIdx, selectedLevelIdx,
      selectedSessionIdx, this.state.stepIdx, progress);
    this.props.updateUserTrainingPlanProgress(progress);

    // Remove pending progress for the current step
    SensitiveInfo.getItem(storageKeys.GUIDED_TRAINING_PENDING_PROGRESS)
      .then((pendingProgress = {}) => {
        const remainingProgress = omit(pendingProgress,
          `${selectedPlanIdx}.${selectedLevelIdx}.${selectedSessionIdx}.${selectedStepIdx}`);

        SensitiveInfo.setItem(storageKeys.GUIDED_TRAINING_PENDING_PROGRESS, remainingProgress);
      });

    const currentPlan = plans[selectedPlanIdx];
    if (isTrainingPlanComplete(currentPlan.levels, progress[currentPlan._id])) {
      // Training plan is complete, show congratulatory message
      this.props.showPartialModal({
        topView: <Icon name="star" style={styles.planCompletedStarIcon} />,
        title: {
          caption: 'Congratulations!',
        },
        detail: {
          caption: [
            'You\'ve completed the ',
            currentPlan.name || '',
            ' training program. Stay tuned for additional training programs.',
          ].join(''),
        },
        buttons: [{ caption: 'OK' }],
        backButtonHandler: this.props.hidePartialModal,
      });
    }
  }

  /**
   * Returns all the workouts in the currently selected training plan at the currently
   * selected level and session
   * @param {Object} trainingProps Props from the training reducer slice
   * @return {Object[]} Workouts for the currently selected level and session of the training plan
   */
  _getSessionWorkouts(trainingProps) {
    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
    } = trainingProps;
    return plans[selectedPlanIdx].levels[selectedLevelIdx][selectedSessionIdx];
  }

  /**
   * Returns the workout object at a specified index of the current session
   * @param {Number} workoutIdx Index of the workout to retrieve from the current session
   * @param {Object} trainingProps Props from the training reducer slice
   * @return {Object} The workout at the specified workoutIdx for the current session
   */
  _getWorkoutFromCurrentSession(workoutIdx, trainingProps) {
    return this._getSessionWorkouts(trainingProps)[workoutIdx];
  }

  /**
   * Resets state properties related to the workout. This is used when a new workout
   * needs to be loaded.
   * @param {Object} workout
   * @return {Object} Fresh state properties for a workout
   */
  _getNewStateForWorkout(workout) {
    return {
      side: 1,
      currentWorkout: workout,
      hasWorkoutStarted: false,
      hasTimerStarted: false,
      timerSeconds: workout.seconds,
      isTimerRunning: false,
      setsRemaining: workout.sets,
      leftButtonDepressed: false,
      centerButtonDepressed: false,
      rightButtonDepressed: false,
    };
  }

  /**
   * Starts or resumes the timer
   */
  _startTimer() {
    Mixpanel.trackWithProperties('startTimedWorkout', this._getCurrentWorkoutState());

    // Keep screen awake when timer is running
    KeepAwake.activate();

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

  /**
   * Pauses the timer
   * @param {Function} [cb] Optional callback to invoke after the timer is paused
   */
  _pauseTimer(cb) {
    Mixpanel.trackWithProperties('pauseTimedWorkout', this._getCurrentWorkoutState());

    // Disable permanent screen awake when timer is stopped
    KeepAwake.deactivate();

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.setState({ isTimerRunning: false }, cb);
  }

  /**
   * Changes which workout/step of the session to show
   * @param {Number} step Which step to switch to. The first step starts at 0.
   */
  _changeStep(stepIdx) {
    this.props.selectSessionStep(stepIdx);

    // Check if there's pending progress for the new step
    SensitiveInfo.getItem(storageKeys.GUIDED_TRAINING_PENDING_PROGRESS)
      .then((pendingProgress = {}) => {
        const newState = {
          stepIdx,
          ...this._getNewStateForWorkout(
            this._getWorkoutFromCurrentSession(stepIdx, this.props.training)
          ),
        };

        const {
          selectedPlanIdx,
          selectedLevelIdx,
          selectedSessionIdx,
        } = this.props.training;
        const prevProgress = get(pendingProgress,
          `${selectedPlanIdx}.${selectedLevelIdx}.${selectedSessionIdx}.${stepIdx}`);

        if (prevProgress) {
          // The new step was previously started but didn't completely finish.
          // Load state with the correct side and setsRemaining based on previous progress.
          Object.assign(newState, prevProgress);
        }

        if (this.state.isTimerRunning) {
          this._pauseTimer(() => {
            this.setState(newState);
          });
        } else {
          this.setState(newState);
        }
      });
  }

  /**
   * Handles the logic for all the footer button icons
   * @param {String} buttonName Button name
   */
  _onButtonPress(buttonName) {
    switch (buttonName) {
      case 'leftButton': {
        const isFirstWorkout = this.state.stepIdx === 0;
        if (!isFirstWorkout) {
          // There is a previous workout in the session that can be navigated to
          this._changeStep(this.state.stepIdx - 1);
        }
        break;
      }
      case 'centerButton': {
        const {
          currentWorkout,
          isTimerRunning,
          setsRemaining,
        } = this.state;
        const isTimed = currentWorkout.isTimed;

        if (isTimerRunning) {
          // Pause timer
          this._pauseTimer();
        } else if (isTimed && setsRemaining > 0) {
          // Start/resume timer
          this._startTimer();
        } else if (!currentWorkout.isComplete) {
          // Mark workout as complete
          this._markComplete();
        }
        break;
      }
      case 'rightButton': {
        const sessionWorkouts = this._getSessionWorkouts(this.props.training);
        const isLastWorkout = this.state.stepIdx === sessionWorkouts.length - 1;
        if (!isLastWorkout) {
          // There is a next workout in the session that can be navigated to
          this._changeStep(this.state.stepIdx + 1);
        }
        break;
      }
      default:
        // no-op
    }
  }

  /**
   * Sets the component state to indicate a button is being pressed
   * @param {String} buttonName Button name
   */
  _onButtonShowUnderlay(buttonName) {
    this.setState({ [`${buttonName}Depressed`]: true });
  }

  /**
   * Sets the component state to indicate a button is not being pressed
   * @param {String} buttonName Button name
   */
  _onButtonHideUnderlay(buttonName) {
    this.setState({ [`${buttonName}Depressed`]: false });
  }

  render() {
    const { currentWorkout } = this.state;
    const isTimed = currentWorkout.isTimed;

    const subheading = [];
    if (currentWorkout.reps) {
      subheading.push(`Repetitions: ${currentWorkout.reps}`);
    } else if (currentWorkout.seconds && isTimed) {
      subheading.push(`Time: ${formattedTimeString(currentWorkout.seconds)}`);
    }

    if (currentWorkout.sets) {
      subheading.push(`Sets: ${currentWorkout.sets}`);
    }

    if (currentWorkout.twoSides) {
      subheading[0] += ' per side';
    }

    // If the workout is timed and has already started, the header will display the timer
    // along with the number of sets remaining. Otherwise, display the workout instructions.
    const header = isTimed && this.state.hasWorkoutStarted ? (
      <View style={styles.header}>
        <BodyText style={styles.timer}>{getFormattedTime(this.state.timerSeconds)}</BodyText>
        <BodyText>Sets Remaining: {this.state.setsRemaining}</BodyText>
        {currentWorkout.twoSides && this.state.setsRemaining > 0 &&
          <View style={styles.twoSidedText}>
            <BodyText>Perform with your</BodyText>
            <BodyText style={styles.strongText}>
              {this.state.side === 1 ? ' first ' : ' second '}
            </BodyText>
            <BodyText>side.</BodyText>
          </View>}
      </View>
    ) : (
      <View style={styles.header}>
        <HeadingText size={3}>{currentWorkout.workout.title}</HeadingText>
        <BodyText style={styles.workoutLength}>{subheading.join(' | ')}</BodyText>
        <BodyText style={styles.workoutInstruction}>{currentWorkout.workout.instructions}</BodyText>
      </View>
    );

    const { lightBlue500 } = theme;
    const isPostureSession = currentWorkout.workout.type === workoutTypes.POSTURE;

    // The left button would be disabled if this is the first workout in the session
    const isLeftButtonDisabled = this.state.stepIdx === 0;
    const additionalLeftButtonStyles = {};
    if (isLeftButtonDisabled) {
      additionalLeftButtonStyles.opacity = 0.4;
    }

    // The center button would be disabled if there is an update happening in
    // the training reducer slice, e.g., when the workout is being marked as complete
    const isComplete = currentWorkout.isComplete;
    const isUpdating = this.props.training.isUpdating;
    const isCenterButtonDisabled = (!isTimed && isComplete) || isUpdating || isPostureSession;
    const additionalCenterButtonStyles = {
      backgroundColor: currentWorkout.isComplete ? lightBlue500 : 'white',
    };
    if (isCenterButtonDisabled) {
      additionalCenterButtonStyles.opacity = 0.4;
    }

    // The right button would be disabled if this is the last workout in the session
    const sessionWorkouts = this._getSessionWorkouts(this.props.training);
    const isRightButtonDisabled = this.state.stepIdx === sessionWorkouts.length - 1;
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
          currentStep={this.state.stepIdx + 1}
          totalSteps={sessionWorkouts.length}
          backgroundColor={lightBlue500}
        />
        {header}
        <WorkoutView
          media={currentWorkout.workout.type === workoutTypes.PRIMER ? 'video' : 'image'}
          navigator={this.props.navigator}
          workout={currentWorkout.workout}
          isGuidedTraining
        />
        <View style={styles.footer}>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={lightBlue500}
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
                  style={{ color: this.state.leftButtonDepressed ? 'white' : lightBlue500 }}
                />
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles.footerButtonText}>PREVIOUS</SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={lightBlue500}
              onPress={() => this._onButtonPress('centerButton')}
              onShowUnderlay={() => this._onButtonShowUnderlay('centerButton')}
              onHideUnderlay={() => this._onButtonHideUnderlay('centerButton')}
              style={[styles.footerButton, additionalCenterButtonStyles]}
              disabled={isCenterButtonDisabled}
            >
              <View style={styles.footerButtonIconContainer}>
                {isUpdating ? <Spinner size="large" color={lightBlue500} /> : (
                  <Icon
                    name={centerButtonIconName}
                    size={applyWidthDifference(50)}
                    style={{
                      color: this.state.centerButtonDepressed || currentWorkout.isComplete ?
                        'white' : lightBlue500,
                    }}
                  />
                )}
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles.footerButtonText}>
              {centerButtonIconLabel}
            </SecondaryText>
          </View>
          <View style={styles.footerButtonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={lightBlue500}
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
                  style={{ color: this.state.rightButtonDepressed ? 'white' : lightBlue500 }}
                />
              </View>
            </TouchableHighlight>
            <SecondaryText style={styles.footerButtonText}>NEXT</SecondaryText>
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
  ...trainingActions,
})(GuidedTraining);
