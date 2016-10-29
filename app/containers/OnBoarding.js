import React, { Component } from 'react';
import {
  View,
  Animated,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
  PushNotificationIOS,
} from 'react-native';
import { uniqueId } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import OnBoardingFlow from './onBoardingFlow';
import styles from '../styles/onboarding';

const { width } = Dimensions.get('window');
const { PropTypes } = React;

export default class OnBoarding extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      step: 0,
      valueX: 0,
      animatedValues: new Animated.ValueXY(),
      nickname: null,
      birthdate: null,
      gender: null,
      weight: null,
      height: null,
      pickerType: null,
      weightMetric: 'lbs',
      heightMetric: 'ft in',
      notificationPermissions: false,
    };
    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
    this.selectGender = this.selectGender.bind(this);
    this.setPickerType = this.setPickerType.bind(this);
    this.updateField = this.updateField.bind(this);
  }

  componentWillMount() {
    // Check push notification settings
    PushNotificationIOS.checkPermissions(permissions => {
      // If push notifications are already enabled, go to next step
      if (permissions.alert) {
        this.setState({
          notificationPermissions: true,
        });
      } else {
        // Set listener for user enabling push notifications
        PushNotificationIOS.addEventListener('register', () => (
          this.setState({
            notificationPermissions: true,
          })
        ));
      }
    });
  }

  componentWillUnmount() {
    // Remove notifications event listener to prevent memory leaks
    PushNotificationIOS.removeEventListener('register');
  }

  // Returns an array with multiple style objects
  getStepStyle() {
    return [
      styles.onBoardingFlowContainer,
      { transform: this.state.animatedValues.getTranslateTransform() },
    ];
  }

  setPickerType(info) {
    Keyboard.dismiss();

    this.setState({
      pickerType: info || null,
    });
  }

  // Combines the separate onboarding step components into one
  loadOnBoardingFlow() {
    const steps = OnBoardingFlow.map((step, i) => (
      step({
        key: `${step}-${i}`,
        onPress: i === OnBoardingFlow.length - 1 ? this.saveData : this.nextStep,
        navigator: this.props.navigator,
        ...this.state,
        nextStep: this.nextStep,
        previousStep: this.previousStep,
        selectGender: this.selectGender,
        setPickerType: this.setPickerType,
        updateField: this.updateField,
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
    // Do something here
  }

  selectGender(gender) {
    const genderData = this.state.gender ? null : gender;
    this.setState({ gender: genderData });
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
