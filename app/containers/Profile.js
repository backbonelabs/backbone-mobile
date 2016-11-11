import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Alert,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { connect } from 'react-redux';
import userActions from '../actions/user';
import styles from '../styles/profile';
import constants from '../utils/constants';
import ProfilePicker from '../containers/onBoardingFlow/profile/ProfilePicker';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import SecondaryText from '../components/SecondaryText';
import SensitiveInfo from '../utils/SensitiveInfo';
import gradientBackground20 from '../images/gradientBackground20.png';

/* eslint-disable max-len */
const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
/* eslint-disable max-len */

const {
  height: heightConstants,
  weight: weightConstants,
} = constants;

const ProfileFieldTitle = props => (
  <View style={styles.profileFieldTitle}>
    <BodyText>{props.title}</BodyText>
    { props.edited && <SecondaryText> {props.editedText}</SecondaryText> }
  </View>
);

ProfileFieldTitle.propTypes = {
  title: PropTypes.string,
  edited: PropTypes.bool,
  editedText: PropTypes.string,
};

const ProfileField = props => (
  <TouchableOpacity style={styles.profileField} onPress={props.onPress}>
    <ProfileFieldTitle title={props.title} edited={props.edited} editedText="(edited)" />
    <View style={styles.profileFieldData}>
      <SecondaryText style={styles._profileText}>{props.profileData}</SecondaryText>
    </View>
  </TouchableOpacity>
);

ProfileField.propTypes = {
  title: PropTypes.any,
  edited: PropTypes.bool,
  onPress: PropTypes.func,
  profileData: PropTypes.string,
};

const ProfileFieldInput = props => (
  <View style={styles.profileField}>
    <ProfileFieldTitle
      title={props.title}
      edited={props.edited}
      editedText={props.editedText || '(edited)'}
    />
    <View style={styles.profileFieldData}>
      <Input
        style={styles._profileFieldInput}
        {...props.extraProps}
        onBlur={() => props.blurHandler(props.field)}
        value={props.value}
        autoCorrect={false}
        autoCapitalize="none"
        onChangeText={value => props.updateProfile([props.field], value)}
      />
    </View>
  </View>
);

ProfileFieldInput.propTypes = {
  field: PropTypes.string,
  value: PropTypes.string,
  extraProps: PropTypes.object,
  updateProfile: PropTypes.func,
  blurHandler: PropTypes.func,
  edited: PropTypes.bool,
  editedText: PropTypes.string,
  title: PropTypes.string,
};

class Profile extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    user: PropTypes.shape({
      user: PropTypes.shape({
        _id: PropTypes.string,
        settings: PropTypes.shape({
          slouchTimeThreshold: PropTypes.number,
          postureThreshold: PropTypes.number,
          backboneVibration: PropTypes.bool,
          phoneVibration: PropTypes.bool,
          vibrationPattern: PropTypes.number,
        }),
        nickname: PropTypes.string,
        email: PropTypes.string,
        birthdate: PropTypes.date,
        height: PropTypes.number,
        weight: PropTypes.number,
        weightUnitPreference: PropTypes.number,
        heightUnitPreference: PropTypes.number,
      }),
      isUpdating: PropTypes.bool,
    }),
  };

  constructor(props) {
    super(props);
    const { user } = this.props.user;
    this.state = {
      nickname: user.nickname,
      gender: user.gender,
      birthdate: new Date(user.birthdate),
      height: {
        initialValue: null,
        value: null,
        unit: null,
        label: '',
      },
      weight: {
        initialValue: null,
        value: null,
        unit: null,
        label: '',
      },
      email: user.email,
      pickerType: null,
    };
    this.updateProfile = this.updateProfile.bind(this);
    this.saveData = this.saveData.bind(this);
    this.fieldInputBlurHandler = this.fieldInputBlurHandler.bind(this);
  }

  componentWillMount() {
    const { user } = this.props.user;

    this.props.dispatch(userActions.fetchUser());
    this._setHeightValue(user);
    this._setWeightValue(user);
  }

  componentWillReceiveProps(nextProps) {
    // isUpdating is truthy while user is saving profile info
    // If it goes from true to false, operation is complete
    if (this.props.user.isUpdating && !nextProps.user.isUpdating) {
      if (nextProps.user.errorMessage) {
        // If trying to save user profile info or access this scene
        // without having properly logged in, it'll throw an error
        Alert.alert('Error', 'Invalid user');
      } else {
        SensitiveInfo.setItem(constants.userStorageKey, nextProps.user.user);
        this._setHeightValue(nextProps.user.user);
        this._setWeightValue(nextProps.user.user);
      }
    }
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

  /**
   * Sync state to user's height information
   * @param  {Object}  userProps  User data
   */
  _setHeightValue(userProps) {
    const equalsInch = userProps.heightUnitPreference === heightConstants.units.IN;
    const inchesToCentimeters = userProps.height * heightConstants.conversionValue;

    this.setState({
      height: {
        // Save initial user height value for comparison use
        initialValue: userProps.height,
        value: Math.round(equalsInch ? userProps.height : inchesToCentimeters),
        unit: userProps.heightUnitPreference,
        label: '',
      },
    });
  }

  /**
   * Sync state to user's weight information
   * @param  {Object}  userProps  User data
   */
  _setWeightValue(userProps) {
    const { ceil, round } = Math;
    const equalsPound = userProps.weightUnitPreference === weightConstants.units.LB;
    const poundToKilogram = userProps.weight * weightConstants.conversionValue;

    this.setState({
      weight: {
        // Save initial user height value for comparison use
        initialValue: userProps.weight,
        value: equalsPound ? round(userProps.weight) : ceil(poundToKilogram),
        unit: userProps.weightUnitPreference,
        label: '',
      },
    });
  }

  /**
   * Convert the measurement value into an appropriate formatted "label"
   * @param {Object}  value  Current height value
   * @return {String}  Returns a formatted height measurement string
   */
  _setHeightLabel(value) {
    const { user } = this.props.user;
    const equalsInch = user.heightUnitPreference === heightConstants.units.IN;
    const inchLabel = `${Math.floor(value / 12)}ft ${value % 12}in`;
    const centimeterLabel = `${Math.round(value * heightConstants.conversionValue)}
      ${constants.weightUnitIdToLabel[user.weightUnitPreference].toLowerCase()}`;
    return equalsInch ? inchLabel : centimeterLabel;
  }

  /**
   * Convert the measurement value into an appropriate formatted "label"
   * @param  {Object}  value  Current weight value
   * @return {String}  Returns a formatted weight measurement string
   */
  _setWeightLabel(value) {
    return `${value}${constants.weightUnitIdToLabel[this.state.weight.unit].toLowerCase()}`;
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

  /**
   * Sets input value to user profile field's value if field is empty or, if field
   * is an email, fails email validation
   * @param {String}  field  Object key for accessing state/prop value
   */
  fieldInputBlurHandler(field) {
    // Check if state property value is falsy
    if (!this.state[field]) {
      this.updateProfile(field, this.props.user.user[field]);
    } else if (field === 'email' && !emailRegex.test(this.state[field])) {
      this.updateProfile(field, this.props.user.user[field]);
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
      email,
    } = this.state;

    const profileData = {
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

    if (email !== this.props.user.user.email) {
      profileData.email = email;
    }

    this.props.dispatch(userActions.updateUser({
      _id: this.props.user.user._id,
      ...profileData,
    }));
  }

  render() {
    const {
      email,
      nickname,
      gender,
      birthdate,
      height,
      weight,
      pickerType,
    } = this.state;
    const { user, isUpdating } = this.props.user;

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Image source={gradientBackground20} style={styles.backgroundImage}>
          <View style={styles.spacer} />
          <View style={styles.profileFieldContainer}>
            <ProfileFieldInput
              title="Nickname"
              edited={nickname !== user.nickname}
              field="nickname"
              value={nickname}
              extraProps={{ maxLength: 18 }}
              updateProfile={this.updateProfile}
              blurHandler={this.fieldInputBlurHandler}
            />
            <ProfileField
              onPress={() => this.setState({
                gender: constants.gender.male === gender ? 2 : 1,
              })}
              title="Gender"
              edited={gender !== user.gender}
              profileData={constants.gender.male === gender ? 'Male' : 'Female'}
            />
            <ProfileField
              onPress={() => this.setPickerType('birthdate')}
              title="Birthdate"
              edited={birthdate.getTime() !== new Date(user.birthdate).getTime()}
              profileData={`${constants.months[birthdate.getMonth()]} ${
                  birthdate.getDate()}, ${birthdate.getFullYear()}`}
            />
            <ProfileField
              onPress={() => this.setPickerType('height')}
              title="Height"
              edited={height.initialValue !== height.value}
              profileData={this._setHeightLabel(height.value)}
            />
            <ProfileField
              onPress={() => this.setPickerType('weight')}
              title="Weight"
              edited={weight.initialValue !== weight.value}
              profileData={this._setWeightLabel(weight.value)}
            />
            <ProfileFieldInput
              title="Email"
              edited={email !== user.email || !user.isConfirmed}
              editedText={!user.isConfirmed ? '(unconfirmed)' : ''}
              field="email"
              value={email}
              updateProfile={this.updateProfile}
              blurHandler={this.fieldInputBlurHandler}
            />
          </View>
          <View style={styles.bottomSpacerContainer}>
            { pickerType ?
              <ProfilePicker
                birthdate={birthdate}
                height={height}
                weight={weight}
                setPickerType={this.setPickerType}
                pickerType={pickerType}
                updateProfile={this.updateProfile}
              /> :
                <View>
                  { isUpdating ?
                    <Spinner />
                      :
                        <Button
                          primary
                          style={{ alignSelf: 'center' }}
                          text="SAVE"
                          onPress={this.saveData}
                          disabled={
                            email === user.email &&
                            nickname === user.nickname &&
                            gender === user.gender &&
                            birthdate.getTime() === new Date(user.birthdate).getTime() &&
                            height.initialValue === height.value &&
                            weight.initialValue === weight.value
                          }
                        />
                  }
                </View>
              }
          </View>
        </Image>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(Profile);
