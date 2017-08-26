import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Image,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import userActions from '../actions/user';
import styles from '../styles/profile';
import constants from '../utils/constants';
import ProfilePicker from './onBoardingFlow/profile/ProfilePicker';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import backboneLogo from '../images/logo.png';

const {
  height: heightConstants,
  weight: weightConstants,
} = constants;

const iconMap = {
  FontAwesome: FontAwesomeIcon,
  MaterialIcon: MaterialIcons,
};

const ProfileField = props => {
  const {
    iconFont,
    iconLeftName,
    } = props;
  const Icon = iconMap[iconFont];
  // Pressing on a profile field initiates editing
  return (<TouchableOpacity
    style={styles.profileField}
    onPress={props.onPress}
  >
    {Icon && iconLeftName
          ? <Icon
            name={iconLeftName}
            size={styles.$iconSize}
            style={styles.profileFieldIcon}
          />
          : null}
    <View style={styles.profileFieldData}>
      <SecondaryText style={styles._profileText}>{props.profileData}</SecondaryText>
    </View>
  </TouchableOpacity>);
};

ProfileField.propTypes = {
  title: PropTypes.any,
  edited: PropTypes.bool,
  onPress: PropTypes.func,
  profileData: PropTypes.string,
  iconFont: PropTypes.oneOf(['FontAwesome', 'MaterialIcon']),
  iconLeftName: PropTypes.string, // maps to a font name in react-native-icons
};

const ProfileFieldInput = props => {
  const {
    iconFont,
    iconLeftName,
    } = props;

  const Icon = iconMap[iconFont];
  return (
    <View style={styles.profileField}>
      <Icon name={iconLeftName} size={styles.$iconSize} style={styles._profileFieldIcon} />
      <TextInput
        style={styles._profileFieldInput}
        onBlur={() => props.blurHandler(props.field)}
        defaultValue={props.value}
        autoCorrect={false}
        keyboardType={props.keyboardType}
        autoCapitalize="none"
        onChangeText={value => props.fieldInputChangeHandler(props.field, value)}
        editable
      />
    </View>);
};

ProfileFieldInput.propTypes = {
  field: PropTypes.string,
  value: PropTypes.string,
  fieldInputChangeHandler: PropTypes.func,
  blurHandler: PropTypes.func,
  edited: PropTypes.bool,
  editedText: PropTypes.string,
  title: PropTypes.string,
  keyboardType: PropTypes.string,
  iconFont: PropTypes.oneOf(['FontAwesome', 'MaterialIcon']),
  iconLeftName: PropTypes.string, // maps to a font name in react-native-icons
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
    pendingUser: PropTypes.object,
  };

  constructor(props) {
    super(props);
    autobind(this);
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
      invalidData: false,
    };
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
        this._setHeightValue(nextProps.user);
        this._setWeightValue(nextProps.user);
        Alert.alert('Success', 'Profile updated');
      }
    }
  }

  componentWillUnmount() {
    // Remove any pending changes upon component unmount
    this.props.dispatch(userActions.prepareUserUpdate(null));
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
    const { round } = Math;
    const equalsInch = userProps.heightUnitPreference === heightConstants.units.IN;
    const inchesToCentimeters = userProps.height * heightConstants.conversionValue;

    this.setState({
      height: {
        // Save initial user height value for comparison use
        initialValue: round(equalsInch ? userProps.height : inchesToCentimeters),
        value: round(equalsInch ? userProps.height : inchesToCentimeters),
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
    const { unit } = this.state.height;
    const equalsInch = unit === heightConstants.units.IN;
    const inchLabel = `${Math.floor(value / 12)}ft ${value % 12}in`;
    const centimeterLabel = `${Math.round(value)}${
      constants.heightUnitIdToLabel[unit].toLowerCase()}`;
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
   * Handles changes and input validation
   * @param {String}  field  Object key for accessing state/prop value
   * @param {String}  value  Text input value
   */
  fieldInputChangeHandler(field, value) {
    let invalidData = false;

    // Check if field is an email, if truthy, validate with regex
    if (field === 'email' && !constants.emailRegex.test(value)) {
      // Case: User is currently editing email field
      // Fails validation, prevent saving to profile
      invalidData = true;
    } else if (!value) {
      // Case: User is currently editing email/nickname field
      // Input field is empty, prevent saving to profile
      invalidData = true;
    } else if (!constants.emailRegex.test(this.state.email)) {
      // Case: User editing field other than email (didn't fix invalid email error')
      // Email state fails validation, prevent saving to profile
      invalidData = true;
    } else if (this.props.pendingUser && this.props.pendingUser.invalidData) {
      // Input value/state passes email validation and input isn't empty, allow save
      invalidData = false;
    }

    // Update invalidData and updateProfile
    this.setState({ invalidData }, () => this.updateProfile(field, value));
  }

  /**
   * Resets field back to initial user profile value if validation fails
   * @param {String}  field  Object key for accessing state/prop value
   */
  fieldInputBlurHandler(field) {
    // Check if state property value is falsy
    if (!this.state[field]) {
      Alert.alert('Error', 'Field cannot be empty, please try again');
      // Use input change handler to reset field and validate fields/state
      this.fieldInputChangeHandler(field, this.props.user[field]);
    } else if (field === 'email' && !constants.emailRegex.test(this.state[field])) {
      // Check if field is an email, if truthy, validate with regex
      Alert.alert('Error', 'Not a valid email, please try again');
    }
  }

  // Verify that state is different from previously saved user data
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
      invalidData,
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
      invalidData,
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

    return (
      <KeyboardAwareScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            { isFetching || isUpdating ?
              <Spinner style={{ flex: 1 }} />
              :
                <View style={styles.profileFieldContainer}>
                  <TouchableWithoutFeedback>
                    <View style={styles.profileHeader}>
                      <Image
                        source={backboneLogo}
                        style={styles.profileHeaderUserImage}
                        resizeMode="contain"
                      />
                      <SecondaryText style={styles.profileHeaderNickname}>{nickname}</SecondaryText>
                    </View>
                  </TouchableWithoutFeedback>
                  <ProfileFieldInput
                    edited={nickname !== user.nickname}
                    field="nickname"
                    keyboardType="default"
                    value={nickname}
                    fieldInputChangeHandler={this.fieldInputChangeHandler}
                    blurHandler={this.fieldInputBlurHandler}
                    iconFont="FontAwesome"
                    iconLeftName="user"
                  />
                  <ProfileField
                    onPress={() => this.updateProfile('gender',
                      constants.gender.male === gender ?
                        constants.gender.female
                        :
                          constants.gender.male)}
                    edited={gender !== user.gender}
                    profileData={constants.gender.male === gender ? 'Male' : 'Female'}
                    iconFont="FontAwesome"
                    iconLeftName="transgender"
                  />
                  <ProfileField
                    onPress={() => this.setPickerType('birthdate')}
                    edited={birthdate.getTime() !== new Date(user.birthdate).getTime()}
                    profileData={`${constants.months[birthdate.getMonth()]} ${
                        birthdate.getDate()}, ${birthdate.getFullYear()}`}
                    iconFont="MaterialIcon"
                    iconLeftName="cake"
                  />
                  <ProfileField
                    onPress={() => this.setPickerType('height')}
                    edited={height.initialValue !== height.value}
                    profileData={this._setHeightLabel(height.value)}
                    iconFont="MaterialIcon"
                    iconLeftName="assignment"
                  />
                  <ProfileField
                    onPress={() => this.setPickerType('weight')}
                    edited={weight.initialValue !== weight.value}
                    profileData={this._setWeightLabel(weight.value)}
                    iconFont="FontAwesome"
                    iconLeftName="balance-scale"
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
                    keyboardType="email-address"
                    value={email}
                    fieldInputChangeHandler={this.fieldInputChangeHandler}
                    blurHandler={this.fieldInputBlurHandler}
                    iconFont="MaterialIcon"
                    iconLeftName="email"
                  />
                  <ProfileField
                    onPress={() => this.setPickerType('weight')}
                    edited={weight.initialValue !== weight.value}
                    profileData="Change password"
                    iconFont="MaterialIcon"
                    iconLeftName="lock"
                  />
                  <ProfileField
                    onPress={() => this.setPickerType('weight')}
                    edited={weight.initialValue !== weight.value}
                    profileData="Connect with Facebook"
                    iconFont="FontAwesome"
                    iconLeftName="facebook-official"
                  />
                  <View style={styles.logoutSpacerContainer} />
                  <ProfileField
                    onPress={() => this.setPickerType('weight')}
                    edited={weight.initialValue !== weight.value}
                    profileData="Logout"
                    iconFont="FontAwesome"
                    iconLeftName="power-off"
                    style={styles.logout}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Profile);
