import React, { Component } from 'react';
import {
  View,
  Animated,
  Dimensions,
  PushNotificationIOS,
} from 'react-native';
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
      birthdate: new Date(),
      gender: null,
      weight: null,
      height: null,
      pickerType: null,
    };
    this.nextStep = this.nextStep.bind(this);
    this.selectGender = this.selectGender.bind(this);
    this.previousStep = this.previousStep.bind(this);
    this.setPickerType = this.setPickerType.bind(this);
    this.updateBirthdate = this.updateBirthdate.bind(this);
  }

  componentWillMount() {
    // Check push notification settings
    PushNotificationIOS.checkPermissions(permissions => {
      // If push notifications are already enabled, go to next step
      if (permissions.alert) {
        this.nextStep();
      } else {
        // Set listener for user enabling push notifications
        PushNotificationIOS.addEventListener('register', this.nextStep);
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

  // Combines the separate onboarding step components into one
  loadOnBoardingFlow() {
    const steps = OnBoardingFlow.map((step, i) => (
      step({
        key: i,
        onPress: i === OnBoardingFlow.length - 1 ? this.saveData : this.nextStep,
        currentStep: this.state.step,
        gender: this.state.gender,
        pickerType: this.state.pickerType,
        setPickerType: this.setPickerType,
        selectGender: this.selectGender,
        birthdate: this.state.birthdate,
        updateBirthdate: this.updateBirthdate,
        navigator: this.props.navigator,
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

  updateBirthdate(date) {
    this.setState({ birthdate: date });
  }

  setPickerType(info) {
    this.setState({
      pickerType: info,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.progressCircleContainer}>
          { OnBoardingFlow.map((value, key) => (
            <View key={key}>
              <Icon
                name={this.state.step > key ? 'check-circle' : 'circle-o'}
                size={40}
                color="red"
              />
            </View>
          )) }
        </View>
        { this.loadOnBoardingFlow() }
      </View>
    );
  }
}
