import React, { Component, PropTypes } from 'react';
import {
  View,
  Animated,
  Keyboard,
  Platform,
  Dimensions,
  PushNotificationIOS,
  TouchableWithoutFeedback,
} from 'react-native';
import { connect } from 'react-redux';
import { pick, uniqueId } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import OnBoardingFlow from './onBoardingFlow';
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
        type: 'ft in',
        label: '',
      },
      weight: {
        value: null,
        type: 'lbs',
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
    // Only to be run on iOS devices
    if (Platform.OS === 'ios') {
      // Check push notification settings
      PushNotificationIOS.checkPermissions(permissions => {
        // If push notifications are already enabled, go to next step
        if (permissions.alert) {
          this.updateField('notificationsEnabled', true);
        } else {
          // Set listener for user enabling push notifications
          PushNotificationIOS.addEventListener('register', () => {
            this.updateField('notificationsEnabled', true);
          });
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isUpdating && !nextProps.isUpdating) {
      this.nextStep();
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

  setPickerType(info) {
    Keyboard.dismiss();

    this.setState({ pickerType: info || null });
  }

  // Combines the separate onboarding step components into one
  loadOnBoardingFlow() {
    const steps = OnBoardingFlow.map((step, i) => (
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
    ));
    return <Animated.View style={this.getStepStyle()}>{steps}</Animated.View>;
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

  // Store onboarding data all at once
  saveData() {
    this.setState({ hasOnboarded: true }, () => {
      const profileData = pick(this.state, [
        'nickname',
        'gender',
        'hasOnboarded',
      ]);

      // Only store weight/height values on backend
      profileData.weight = this.state.weight.value;
      profileData.height = this.state.height.value;

      this.props.dispatch(userActions.updateUser({
        _id: this.props.user._id,
        ...profileData,
      }));
    });
  }

  updateField(field, value) {
    this.setState({ [field]: value });
  }

  // Animates transition from one onboarding step to another
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
          { OnBoardingFlow.map((value, key) => (
            <Icon
              key={`progressIconKey-${uniqueId()}`}
              name={this.state.step > key ? 'check-square-o' : 'square-o'}
              size={44}
              color={styles._progressIcon.backgroundColor}
            />
          )) }
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
