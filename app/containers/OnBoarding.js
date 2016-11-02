import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Animated,
  Keyboard,
  Platform,
  Dimensions,
  PushNotificationIOS,
  TouchableWithoutFeedback,
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import constants from '../utils/constants';
import onBoardingFlow from './onBoardingFlow';
import styles from '../styles/onboarding';
import userActions from '../actions/user';

const { width } = Dimensions.get('window');

class OnBoarding extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    dispatch: PropTypes.func,
    user: PropTypes.shape({
      _id: PropTypes.string,
    }),
    isUpdating: PropTypes.bool,
  };

  constructor() {
    super();
    this.state = {
      step: 0,
      valueX: 0,
      animatedValues: new Animated.ValueXY(),
      nickname: null,
      birthdate: null,
      gender: null,
      height: {
        value: null,
        type: 'in',
        label: '',
      },
      weight: {
        value: null,
        type: 'lb',
        label: '',
      },
      pickerType: null,
      hasOnboarded: false,
      notificationsEnabled: false,
    };
    this.saveData = this.saveData.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
    this.setPickerType = this.setPickerType.bind(this);
    this.updateField = this.updateField.bind(this);
  }

  componentWillMount() {
    // Check if user has enabled notifications on their iOS device
    if (Platform.OS === 'ios') {
      // Check notification permissions
      PushNotificationIOS.checkPermissions(permissions => {
        // Update notificationsEnabled to true if permissions enabled
        if (permissions.alert) {
          this.updateField('notificationsEnabled', true);
        } else {
          // Listener for enabling notifications event if permissions disabled
          PushNotificationIOS.addEventListener('register', () => {
            this.updateField('notificationsEnabled', true);
          });
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // isUpdating is truthy while user is saving profile info
    // If it goes from true to false, operation is complete
    if (this.props.isUpdating && !nextProps.isUpdating) {
      // Check whether user has successfully completed onboarding
      if (nextProps.hasOnboarded) {
        this.nextStep();
      } else {
        Alert.alert('Error', 'Unable to save, please try again');
      }
    }
  }

  componentWillUnmount() {
    // Remove notifications event listener to prevent memory leaks
    PushNotificationIOS.removeEventListener('register');
  }

  // Returns an array with multiple style objects
  getStepStyle() {
    return [
      styles.onboardingFlowContainer,
      { transform: this.state.animatedValues.getTranslateTransform() },
    ];
  }

  /**
   * Opens and closes the selected data picker component
   * @const {String} pickerType
   */
  setPickerType(pickerType) {
    // Dismiss keyboard, in case user was inputting nickname
    Keyboard.dismiss();

    // Open selected data picker if pickerType is passed in
    // Close selected data picker if pickerType is undefined
    this.setState({ pickerType: pickerType || null });
  }

  loadOnBoardingFlow() {
    return (
      <Animated.View style={this.getStepStyle()}>
        { // Renders the separate onboarding steps under a single component
          onBoardingFlow.map((step, i) => (
            step({
              key: `${i}`,
              navigator: this.props.navigator,
              isUpdating: this.props.isUpdating,
              saveData: this.saveData,
              nextStep: this.nextStep,
              previousStep: this.previousStep,
              setPickerType: this.setPickerType,
              updateField: this.updateField,
              ...this.state,
            })
          ))
        }
      </Animated.View>
    );
  }

  // Transitions back to previous onboarding step
  previousStep() {
    this.setState({
      step: this.state.step - 1,
      valueX: this.state.valueX + width,
    }, this.stepTransitionAnimation);
  }

  // Transitions to next onboarding step
  nextStep() {
    this.setState({
      step: this.state.step + 1,
      valueX: this.state.valueX - width,
    }, this.stepTransitionAnimation);
  }

  // Save profile data
  saveData() {
    this.setState({ hasOnboarded: true }, () => {
      const {
        nickname,
        gender,
        hasOnboarded,
        weight,
        height,
      } = this.state;

      const profileData = {
        nickname,
        gender,
        hasOnboarded,

        // Store weight (lb) / height (in) values on backend
        weight: weight.type === 'lb' ?
          weight.value : Math.floor(weight.value / constants.weight.conversionValue),
        height: height.type === 'in' ?
          height.value : Math.floor(height.value / constants.height.conversionValue),
      };

      this.props.dispatch(userActions.updateUser({
        _id: this.props.user._id,
        ...profileData,
      }));
    });
  }

  /**
   * Updates state (field) with value
   * @const {String} field
   * @const {Object} value
   */
  updateField(field, value) {
    this.setState({ [field]: value });
  }

  // Animates onboarding step transition by moving
  // component along the x-axis specified in valueX
  stepTransitionAnimation() {
    Animated.spring(this.state.animatedValues, {
      tension: 10,
      toValue: {
        x: this.state.valueX,
        y: 0,
      },
    }).start();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.progressBarContainer}>
          {
            // Render appropriate icon based on the user's onboarding flow progress
            onBoardingFlow.map((value, key) => (
              <Icon
                key={key}
                name={this.state.step > key ? 'check-square-o' : 'square-o'}
                size={44}
                color={styles._progressIcon.backgroundColor}
              />
            ))
          }
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          { this.loadOnBoardingFlow() }
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(OnBoarding);
