import React, { Component } from 'react';
import {
  View,
  Animated,
  Dimensions,
  PushNotificationIOS,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import OnboardingFlow from './onboardingFlow';
import styles from '../styles/onboarding';

const { width } = Dimensions.get('window');

export default class Onboarding extends Component {
  constructor() {
    super();
    this.state = {
      step: 0,
      valueX: 0,
      animatedValues: new Animated.ValueXY(),
    };
    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
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
  animationSequence() {
    Animated.spring(this.state.animatedValues, {
      tension: 10,
      toValue: {
        x: this.state.valueX,
        y: 0,
      },
    }).start();
  }

  // Combines the separate onboarding step components into one
  loadOnboardingFlow() {
    const steps = OnboardingFlow.map((step, i) => (
      step({
        key: i,
        onPress: i === OnboardingFlow.length - 1 ? this.saveData : this.nextStep,
        currentStep: this.state.step,
      })
    ));
    return <Animated.View style={this.getStepStyle()}>{steps}</Animated.View>;
  }

  // Transitions back to previous onboarding step
  previousStep() {
    this.setState({
      step: this.state.step - 1,
      valueX: this.state.valueX + width,
    }, this.animationSequence);
  }

  // Transitions to next onboarding step
  nextStep() {
    this.setState({
      step: this.state.step + 1,
      valueX: this.state.valueX - width,
    }, this.animationSequence);
  }

  // Store onboarding data all at once
  saveData() {
    // Do something here
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.progressCircleContainer}>
          { OnboardingFlow.map((value, key) => (
            <View key={key}>
              <Icon
                name={this.state.step > key ? 'check-circle' : 'circle-o'}
                size={40}
                color="red"
              />
            </View>
          )) }
        </View>
        { this.loadOnboardingFlow() }
      </View>
    );
  }
}
