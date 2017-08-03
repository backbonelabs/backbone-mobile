import React, { Component, PropTypes } from 'react';
import { View, TouchableWithoutFeedback, Platform } from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/profileSetup';
import routes from '../../routes';
import StepBar from '../../components/StepBar';
import ProfileBody from './profile/ProfileBody';
import ProfilePicker from './profile/ProfilePicker';
import Mixpanel from '../../utils/Mixpanel';
import userActions from '../../actions/user';
import constants from '../../utils/constants';

class ProfileSetupTwo extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    step: PropTypes.number,
    gender: PropTypes.number,
    nickname: PropTypes.string,
    dispatch: PropTypes.func,
    user: PropTypes.shape({
      _id: PropTypes.string,
      hasOnboarded: PropTypes.bool,
      nickname: PropTypes.string,
    }),
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      pickerType: null,
      birthdate: null,
      height: {
        value: null,
        unit: null,
        label: null,
      },
      weight: {
        value: null,
        unit: null,
        label: null,
      },
    };
  }

  setPickerType(pickerType) {
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

  // Save profile data
  save() {
    const { birthdate, weight, height } = this.state;

    const profileData = {
      hasOnboarded: true,
      nickname: this.props.nickname,
      gender: this.props.gender,
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

    return this.props.navigator.push(routes.deviceSetup);
  }

    /**
   * Updates state (field) with value
   * @param {String}  field
   * @param {*}       value
   * @param {Boolean} clearPickerType Whether or not to hide picker components on update
   */
  updateProfile(field, value) {
    const newState = { [field]: value };

    // For Android
    // When user picks a date and presses 'ok', dismiss the datepicker
    // When user presses cancel, dismiss datepicker and keep the current value
    if (Platform.OS !== 'ios') {
      if (field === 'birthdate') {
        newState.pickerType = null;
        if (value === null) {
          delete newState.birthdate;
        }
      }
    }

    this.setState(newState);
  }


  handleOnClick() {
    if (this.state.pickerType) {
      this.setState({ pickerType: null });
    }
  }

  render() {
    const { birthdate, weight, height } = this.state;

    return (
      <TouchableWithoutFeedback onPress={this.handleOnClick}>
        <View style={styles._container}>
          <View>
            <View style={styles.innerContainer}>
              <StepBar step={2} style={styles._stepBar} />
              <BodyText style={styles._header}>
                Great! Now just some basic information to help us better customize your experience.
              </BodyText>
              <ProfileBody
                setPickerType={this.setPickerType}
                birthdate={this.state.birthdate}
                height={this.state.height}
                weight={this.state.weight}
                currentPickerType={this.state.pickerType}
              />
            </View>
            <View style={styles.CTAContainer}>
              <Button
                style={styles._CTAButton}
                text="CONTINUE"
                primary
                disabled={!height.value || !weight.value || !birthdate}
                onPress={this.save}
              />
            </View>
            { this.state.pickerType ?
              <ProfilePicker
                birthdate={this.state.birthdate}
                height={this.state.height}
                weight={this.state.weight}
                setPickerType={this.setPickerType}
                pickerType={this.state.pickerType}
                updateProfile={this.updateProfile}
              /> : null
            }
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state) => ({ user: state.user.user });

export default connect(mapStateToProps)(ProfileSetupTwo);
