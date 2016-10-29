import React, { Component } from 'react';
import {
  View,
  Animated,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
  PushNotificationIOS,
} from 'react-native';
import { connect } from 'react-redux';
import { pick, uniqueId } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import OnboardingFlow from './onboardingFlow';
import styles from '../styles/onboarding';
import userActions from '../actions/user';

const { width } = Dimensions.get('window');
const { PropTypes } = React;

class Onboarding extends Component {
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
      weight: {
        value: '',
        type: 'lbs',
      },
      height: {
        value: '',
        type: 'ft in',
      },
      pickerType: null,
      hasOnboarded: false,
      notificationEnabled: false,
    };
    this.saveData = this.saveData.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
    this.setPickerType = this.setPickerType.bind(this);
    this.updateField = this.updateField.bind(this);
  }

  componentWillMount() {
    // Check push notification settings
    PushNotificationIOS.checkPermissions(permissions => {
      // If push notifications are already enabled, go to next step
      if (permissions.alert) {
        this.updateField('notificationEnabled', true);
      } else {
        // Set listener for user enabling push notifications
        PushNotificationIOS.addEventListener('register', () => {
          this.updateField('notificationEnabled', true);
        });
      }
    });
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

    this.setState({
      pickerType: info || null,
    });
  }

  // Combines the separate onboarding step components into one
  loadOnboardingFlow() {
    const steps = OnboardingFlow.map((step, i) => (
      step({
        key: `${i}`,
        navigator: this.props.navigator,
        isUpdating: this.props.isUpdating,
        ...this.state,
        saveData: this.saveData,
        nextStep: this.nextStep,
        previousStep: this.previousStep,
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
    this.setState({ hasOnboarded: true }, () => {
      const profileData = pick(this.state, [
        'nickname',
        'gender',
        'weight',
        'height',
        'hasOnboarded',
      ]);

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
          { OnboardingFlow.map((value, key) => (
            <Icon
              key={`progressIconKey-${uniqueId()}`}
              name={this.state.step > key ? 'check-square-o' : 'square-o'}
              size={44}
              color={styles._progressIcon.backgroundColor}
            />
          )) }
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          { this.loadOnboardingFlow() }
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Onboarding);
