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
import Input from '../components/Input';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import SensitiveInfo from '../utils/SensitiveInfo';
import Spinner from '../components/Spinner';
import gradientBackground20 from '../images/gradientBackground20.png';

const {
  height: heightConstants,
  weight: weightConstants,
} = constants;

const ProfileFieldTitle = props => (
  <View style={styles.profileFieldTitle}>
    <BodyText>{props.title}</BodyText>
    { // Display text which signifies profile field has been edited
      props.edited && <SecondaryText> {props.editedText}</SecondaryText> }
  </View>
);

ProfileFieldTitle.propTypes = {
  title: PropTypes.string,
  edited: PropTypes.bool,
  editedText: PropTypes.string,
};

const ProfileField = props => (
  // Pressing on a profile field initiates editing
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
      // Show optional edited text if needed (e.g. "unconfirmed" for email)
      editedText={props.editedText || '(edited)'}
    />
    <View style={styles.profileFieldData}>
      <Input
        style={styles._profileFieldInput}
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
      _id: PropTypes.string,
      nickname: PropTypes.string,
      gender: PropTypes.number,
      email: PropTypes.string,
      birthdate: PropTypes.date,
      height: PropTypes.number,
      weight: PropTypes.number,
      weightUnitPreference: PropTypes.number,
      heightUnitPreference: PropTypes.number,
      isConfirmed: PropTypes.bool,
    }),
    isFetching: PropTypes.bool,
    isUpdating: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    const { user } = this.props;
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
    this.setPickerType = this.setPickerType.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.prepareUserUpdate = this.prepareUserUpdate.bind(this);
    this.fieldInputBlurHandler = this.fieldInputBlurHandler.bind(this);
  }

  componentWillMount() {
    // Get latest user data
    this.props.dispatch(userActions.fetchUser());
    // Set height and weight values manually
    // Since we need to format data for certain properties
    this._setHeightValue(this.props.user);
    this._setWeightValue(this.props.user);
  }

  componentWillReceiveProps(nextProps) {
    // isUpdating is truthy during profile save operation
    // If it goes from true to false, operation is complete
    if (this.props.isUpdating && !nextProps.isUpdating) {
      if (nextProps.errorMessage) {
        // Display an alert when failing to save changed user data
        Alert.alert('Error', 'Failed to save changes, please try again');
      } else {
        // Upon a successful user save, store updated user locally
        SensitiveInfo.setItem(constants.userStorageKey, nextProps.user);
        this._setHeightValue(nextProps.user);
        this._setWeightValue(nextProps.user);
        Alert.alert('Success', 'Profile updated');
      }
    }
  }

  /**
   * Opens and closes the selected data picker component
   * @param {String} pickerType Data picker to open. If undefined, the
   *                            data pickers will be hidden
   */
  setPickerType(pickerType) {
    // Dismiss keyboard, in case user was editing nickname or email
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
   * Format user's height data and save to height state
   * @param  {Object}  userProps  User data
   */
  _setHeightValue(userProps) {
    const equalsInch = userProps.heightUnitPreference === heightConstants.units.IN;
    const inchesToCentimeters = userProps.height * heightConstants.conversionValue;

    this.setState({
      height: {
        // Save initial user height value for comparison use
        initialValue: Math.round(equalsInch ? userProps.height : inchesToCentimeters),
        value: Math.round(equalsInch ? userProps.height : inchesToCentimeters),
        unit: userProps.heightUnitPreference,
        label: '',
      },
    });
  }

  /**
   * Format user's weight data and save to weight state
   * @param  {Object}  userProps  User data
   */
  _setWeightValue(userProps) {
    const { ceil, round } = Math;
    const equalsPound = userProps.weightUnitPreference === weightConstants.units.LB;
    const poundToKilogram = userProps.weight * weightConstants.conversionValue;

    this.setState({
      weight: {
        // Save initial user weight value for comparison use
        initialValue: equalsPound ? round(userProps.weight) : ceil(poundToKilogram),
        value: equalsPound ? round(userProps.weight) : ceil(poundToKilogram),
        unit: userProps.weightUnitPreference,
        label: '',
      },
    });
  }

  /**
   * Convert the measurement value into an appropriate formatted label
   * @param  {Object}  value  Current height value
   * @return {String}         Returns a formatted height measurement string
   */
  _setHeightLabel(value) {
    const equalsInch = this.state.height.unit === heightConstants.units.IN;
    const inchLabel = `${Math.floor(value / 12)}ft ${value % 12}in`;
    const centimeterLabel = `${Math.round(value)}${
      constants.heightUnitIdToLabel[this.state.height.unit].toLowerCase()}`;
    return equalsInch ? inchLabel : centimeterLabel;
  }

  /**
   * Convert the measurement value into an appropriate formatted label
   * @param  {Object}  value  Current weight value
   * @return {String}         Returns a formatted weight measurement string
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
    this.setState(newState, this.prepareUserUpdate);
  }

  /**
   * Resets field back to initial user profile value if validation fails
   * @param {String}  field  Object key for accessing state/prop value
   */
  fieldInputBlurHandler(field) {
    // Check if state property value is falsy
    if (!this.state[field]) {
      this.updateProfile(field, this.props.user[field]);
      // Check if field is an email, if truthy, validate with regex
    } else if (field === 'email' && !constants.emailRegex.test(this.state[field])) {
      this.updateProfile(field, this.props.user[field]);
    }
  }

  dataHasChanged() {
    const {
      email,
      nickname,
      gender,
      birthdate,
      height,
      weight,
    } = this.state;
    const { user } = this.props;

    // Check if state is different from current user profile
    if (email === user.email &&
      nickname === user.nickname &&
      gender === user.gender &&
      birthdate.getTime() === new Date(user.birthdate).getTime() &&
      height.initialValue === height.value &&
      weight.initialValue === weight.value) {
      return false;
    }
    return true;
  }

  // Prepare user data for update
  prepareUserUpdate() {
    const {
      nickname,
      gender,
      birthdate,
      weight,
      height,
      email,
    } = this.state;
    const { user } = this.props;

    const profileData = {
      nickname,
      gender,
      birthdate,
      heightUnitPreference: height.unit,
      weightUnitPreference: weight.unit,

      // Ensure weight (lb) / height (in) values will be stored as the base measurements
      weight: weight.unit === constants.weight.units.LB ?
        weight.value : weight.value / constants.weight.conversionValue,
      height: height.unit === constants.height.units.IN ?
        height.value : height.value / constants.height.conversionValue,
    };

    // Check if email has changed and assign separately
    if (email !== user.email) {
      profileData.email = email;
    }

    // Check if data has changed before preparing user update
    if (this.dataHasChanged()) {
      this.props.dispatch(userActions.prepareUserUpdate({
        _id: user._id,
        ...profileData,
      }));
    } else {
      // Nothing has changed/user changed fields back to initial values
      this.props.dispatch(userActions.prepareUserUpdate(null));
    }
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
    const { user, isFetching, isUpdating } = this.props;
    const { gender } = constants;

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Image source={gradientBackground20} style={styles.backgroundImage}>
          { isFetching || isUpdating ?
            <Spinner style={{ flex: 1 }} />
            :
                <View style={styles.profileFieldContainer}>
                  <ProfileFieldInput
                    title="Nickname"
                    // Check if field has been edited
                    edited={nickname !== user.nickname}
                    field="nickname"
                    value={nickname}
                    updateProfile={this.updateProfile}
                    blurHandler={this.fieldInputBlurHandler}
                  />
                  <ProfileField
                    onPress={() => this.updateProfile('gender',
                      constants.gender.male === gender ?
                        constants.gender.female
                        :
                          constants.gender.male)}
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
                    editedText={(() => {
                      // Show appropriate edited text
                      if (email !== user.email) {
                        return;
                      } else if (!user.isConfirmed) {
                        return '(unconfirmed)';
                      }
                    })()}
                    field="email"
                    value={email}
                    updateProfile={this.updateProfile}
                    blurHandler={this.fieldInputBlurHandler}
                  />
                </View>
              }
              <View style={styles.bottomSpacerContainer}>
                { pickerType &&
                  <ProfilePicker
                    birthdate={birthdate}
                    height={height}
                    weight={weight}
                    setPickerType={this.setPickerType}
                    pickerType={pickerType}
                    updateProfile={this.updateProfile}
                  />
                }
              </View>
        </Image>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Profile);
