import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Animated,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  ViewPagerAndroid,
  TouchableOpacity,
  // PushNotificationIOS,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import constants from '../utils/constants';
import onBoardingFlow from './onBoardingFlow';
import styles from '../styles/onboarding';
import authActions from '../actions/auth';
import userActions from '../actions/user';
import routes from '../routes';
import Mixpanel from '../utils/Mixpanel';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

class OnBoarding extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    dispatch: PropTypes.func,
    user: PropTypes.shape({
      _id: PropTypes.string,
      hasOnboarded: PropTypes.bool,
      nickname: PropTypes.string,
      firstName: PropTypes.string,
      gender: PropTypes.number,
      birthdate: PropTypes.string,
    }),
    isUpdating: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    autobind(this);
    const { firstName, gender, birthdate } = this.props.user;
    this.state = {
      step: 0,
      valueX: 0,
      animatedValues: new Animated.ValueXY(),
      nickname: `${firstName}`,
      birthdate: (birthdate ? (new Date(birthdate)) : null),
      gender,
      height: {
        value: null,
        unit: null,
        label: '',
      },
      weight: {
        value: null,
        unit: null,
        label: '',
      },
      pickerType: null,
      // notificationsEnabled: false,
    };
  }

  // componentWillMount() {
  // // Check if user has enabled notifications on their iOS device
  // if (isIOS) {
  //   // Check notification permissions
  //   PushNotificationIOS.checkPermissions(permissions => {
  //     // Update notificationsEnabled to true if permissions enabled
  //     if (permissions.alert) {
  //       this.setState({ notificationsEnabled: true });
  //     } else {
  //       // Listener for enabling notifications event if permissions disabled
  //       PushNotificationIOS.addEventListener('register', () => {
  //         this.setState({ notificationsEnabled: true });
  //       });
  //     }
  //   });
  // }
  // }

  componentWillReceiveProps(nextProps) {
    // isUpdating is truthy while user is saving profile info
    // If it goes from true to false, operation is complete
    if (this.props.isUpdating && !nextProps.isUpdating) {
      // Check whether user has successfully completed onboarding
      if (nextProps.user.hasOnboarded) {
        this.nextStep();
      } else {
        Alert.alert('Error', 'Unable to save, please try again');
      }
    }
  }

  // componentWillUnmount() {
  //   // Remove notifications event listener to prevent memory leaks
  //   PushNotificationIOS.removeEventListener('register');
  // }

  onClose() {
    // check if user already completed step 1
    if (this.props.user.hasOnboarded) {
      return this.props.navigator.replace(routes.postureDashboard);
    }

    return Alert.alert(
            'Are you sure?',
            '\nExiting will log you out and can cause you to lose your information',
            [{ text: 'Cancel' }, { text: 'Logout', onPress: this.exitOnboarding }]
          );
  }

  /**
   * Opens and closes the selected data picker component
   * @param {String} pickerType Data picker to open. If undefined, the
   *                            data pickers will be hidden
   */
  setPickerType(pickerType) {
    // Dismiss keyboard, in case user was inputting nickname
    Keyboard.dismiss();

    if (this.state.pickerType && pickerType && this.state.pickerType !== pickerType) {
      // Switching between two different data pickers (height and weight) should
      // first unmount the currently mounted picker components and then mount a new
      // instance of the new pickers to ensure components start with a fresh state.
      this.setState({ pickerType: null }, () => {
        this.setState({ pickerType: pickerType || null });
      });
    } else {
      this.setState({ pickerType: pickerType || null });
    }
  }

  loadOnBoardingFlow() {
    const pageViews = onBoardingFlow.map((step, i) => (
      step({
        key: `${i}`,
        navigator: this.props.navigator,
        isUpdating: this.props.isUpdating,
        saveData: this.saveData,
        nextStep: this.nextStep,
        previousStep: this.previousStep,
        setPickerType: this.setPickerType,
        updateProfile: this.updateProfile,
        ...this.state,
      })
    ));

    if (isIOS) {
      // For iOS, use Animated.View
      return (
        <Animated.View
          style={[
            styles.onboardingFlowContainer, {
              transform: this.state.animatedValues.getTranslateTransform(),
            },
          ]}
        >
          {pageViews}
        </Animated.View>
      );
    }

    // For Android, use ViewPagerAndroid since Animated.View doesn't work
    // on Android as of RN 0.36. The problem is when the next View is brought
    // into view, the View is not actually visible even though the animated
    // scroll works fine. It seems like any content that is rendered outside the
    // screen view will be clipped and will not appear even when they are moved
    // into the screen view area.
    return (
      <ViewPagerAndroid
        ref={viewPager => { this.viewPager = viewPager; }}
        style={styles.onboardingFlowContainer}
        initialPage={this.state.step}
        scrollEnabled={false}
      >
        {pageViews}
      </ViewPagerAndroid>
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

  // Animates onboarding step transition
  stepTransitionAnimation() {
    if (isIOS) {
      // For iOS, use Animated API to move component along the x-axis specified in valueX
      Animated.spring(this.state.animatedValues, {
        tension: 10,
        toValue: {
          x: this.state.valueX,
          y: 0,
        },
      }).start();
    } else {
      // For Android, use ViewPagerAndroid API to set the page
      this.viewPager.setPage(this.state.step);
    }
  }

  // Save profile data
  saveData() {
    const {
      nickname,
      gender,
      birthdate,
      weight,
      height,
    } = this.state;

    const profileData = {
      hasOnboarded: true,
      nickname,
      gender,
      birthdate,
      heightUnitPreference: height.unit,
      weightUnitPreference: weight.unit,

      // Store weight (lb) / height (in) values on backend
      weight: weight.unit === constants.weight.units.LB ?
        weight.value : weight.value / constants.weight.conversionValue,
      height: height.unit === constants.height.units.IN ?
        height.value : height.value / constants.height.conversionValue,
    };

    Mixpanel.trackWithProperties('saveInitialProfile', {
      userId: this.props.user._id,
    });

    this.props.dispatch(userActions.updateUser({
      _id: this.props.user._id,
      ...profileData,
    }));
  }

  exitOnboarding() {
    // Remove locally stored user data and reset Redux auth/user store
    this.props.dispatch(authActions.signOut());
    this.props.navigator.resetTo(routes.welcome);
  }

  /**
   * Updates state (field) with value
   * @param {String}  field
   * @param {*}       value
   * @param {Boolean} clearPickerType Whether or not to hide picker components on update
   */
  updateProfile(field, value, clearPickerType) {
    const newState = { [field]: value };
    if (clearPickerType) {
      newState.pickerType = null;
    }
    this.setState(newState);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.exitOnboardingIcon}>
          <TouchableOpacity
            style={styles.exitOnboardingButton}
            onPress={this.onClose}
          >
            <Icon
              name={'close'}
              size={styles.$exitIconSize}
              color={styles._exitOnboardingIconColor.backgroundColor}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.progressBarContainer}>
          {
            // Render appropriate icon based on the user's onboarding flow progress
            onBoardingFlow.map((value, key) => (
              <Icon
                key={key}
                name={this.state.step > key ? 'check-square-o' : 'square-o'}
                size={styles.$progressIconSize}
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
