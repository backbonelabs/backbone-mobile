import React, { Component, PropTypes } from 'react';
import {
  View,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import get from 'lodash/get';
import userActions from '../actions/user';
import authActions from '../actions/auth';
import deviceActions from '../actions/device';
import appActions from '../actions/app';
import styles from '../styles/profile';
import constants from '../utils/constants';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import routes from '../routes';
import Facebook from '../containers/Facebook';
import Input from '../components/Input';
import ProfilePicker from '../containers/onBoardingFlow/profile/ProfilePicker';
import theme from '../styles/theme';
import HeadingText from '../components/HeadingText';
import Button from '../components/Button';

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
  const disabledColor = props.disabled ? { color: theme.disabledColor } : null;
  // Pressing on a profile field initiates editing
  return (
    <TouchableOpacity
      style={styles.profileField}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      {Icon && iconLeftName
          ? <Icon
            name={iconLeftName}
            style={[
              styles.profileFieldIcon,
              disabledColor,
            ]}
          />
          : null}
      <View style={styles.profileFieldData}>
        <BodyText style={disabledColor}>
          {props.profileData}
        </BodyText>
      </View>
    </TouchableOpacity>
  );
};

ProfileField.propTypes = {
  style: PropTypes.object,
  title: PropTypes.any,
  edited: PropTypes.bool,
  disabled: PropTypes.bool,
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
      <Icon name={iconLeftName} style={styles.profileFieldIcon} />
      <Input
        style={styles.profileFieldInput}
        onBlur={() => props.blurHandler(props.field)}
        onFocus={props.focusHandler}
        value={props.value}
        autoCorrect={false}
        keyboardType={props.keyboardType}
        autoCapitalize="none"
        onChangeText={value => props.fieldInputChangeHandler(props.field, value)}
        innerContainerStyles={styles.innerContainerStyles}
        editable
      />
    </View>
    );
};

ProfileFieldInput.propTypes = {
  field: PropTypes.string,
  value: PropTypes.string,
  fieldInputChangeHandler: PropTypes.func,
  blurHandler: PropTypes.func,
  focusHandler: PropTypes.func,
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
        authMethod: PropTypes.number,
        isConfirmed: PropTypes.bool,
      }),
      isFetching: PropTypes.bool,
      resendingEmail: PropTypes.bool,
      isUpdating: PropTypes.bool,
      pendingUser: PropTypes.object,
      errorMessage: PropTypes.string,
    }),
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      push: PropTypes.func,
      getCurrentRoutes: PropTypes.func,
    }),
    auth: PropTypes.shape({
      errorMessage: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    autobind(this);
    const { user } = props.user;
    this.isAndroid = Platform.OS === 'android';
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
    this._setHeightValue(this.props.user.user);
    this._setWeightValue(this.props.user.user);
  }

  componentWillReceiveProps(nextProps) {
    // isUpdating is truthy during profile save operation
    // If it goes from true to false, operation is complete
    if (this.props.user.isUpdating &&
      !nextProps.isUpdating &&
      // Prevents results in 'Change password' from causing an alert
      nextProps.currentRoute.name === routes.profile.name) {
      this.setState({ pickerType: null });
      if (nextProps.user.errorMessage) {
        // Display an alert when failing to save changed user data
        this.props.dispatch(appActions.showPartialModal({
          title: {
            caption: 'Error',
            color: theme.warningColor,
          },
          detail: {
            // Display errors when failing to update user
            caption: get(nextProps, 'user.errorMessage', '').includes('Facebook') ?
              nextProps.user.errorMessage : 'Failed to save changes, please try again.',
          },
          buttons: [
            { caption: 'OK' },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      } else {
        this._setHeightValue(nextProps.user.user);
        this._setWeightValue(nextProps.user.user);
        this.props.dispatch(appActions.showPartialModal({
          title: {
            caption: 'Success',
          },
          detail: {
            caption: 'Profile updated',
          },
          buttons: [
            { caption: 'OK' },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      }
    }

    if (this.props.user.resendingEmail && !nextProps.user.resendingEmail) {
      if (nextProps.user.errorMessage) {
        // Display an alert when failing to resend email
        this.props.dispatch(appActions.showPartialModal({
          title: {
            caption: 'Error',
            color: theme.warningColor,
          },
          detail: {
            caption: nextProps.user.errorMessage,
          },
          buttons: [
            { caption: 'OK' },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      } else {
        this.props.dispatch(appActions.showPartialModal({
          title: {
            caption: 'Success',
            color: theme.green400,
          },
          detail: {
            caption: 'A confirmation link has been sent to your email address. ' +
            'Please click the link to confirm your email address.',
          },
          buttons: [
            { caption: 'OK' },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
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
    // Dismiss picker when selecting another field
    if (this.state.pickerType) {
      this.setState({ pickerType: null });
    } else {
      this.setState({ pickerType });
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
   * Signs out the user and disconnects the device
   */
  signOut() {
    this.props.dispatch(appActions.showPartialModal({
      title: {
        caption: 'Sign Out',
      },
      detail: {
        caption: 'Are you sure you want to sign out?',
      },
      buttons: [
        {
          caption: 'OK',
          onPress: () => {
            // Remove locally stored user data and reset Redux auth/user store
            this.props.dispatch(authActions.signOut());
            // Disconnect from device
            this.props.dispatch(deviceActions.disconnect());
            this.props.dispatch(appActions.hidePartialModal());
            this.props.navigator.resetTo(routes.login);
          },
        }, {
          caption: 'Cancel',
        },
      ],
      backButtonHandler: () => {
        this.props.dispatch(appActions.hidePartialModal());
      },
    }));
  }

  /**
   * Updates state (field) with value
   * @param {String}  field
   * @param {*}       value
   * @param {Boolean} clearPickerType Whether or not to hide picker components on update
   */
  updateProfile(field, value, clearPickerType) {
    const newState = { [field]: value };
    const isAndroidCalendar = (this.isAndroid && this.state.pickerType === 'birthdate');
    if (clearPickerType) {
      newState.pickerType = null;
    }
    // Prevents the picker from closing after the picker has moved
    // and closes the picker on Android calendar once the user selects okay
    if (value !== null) {
      this.setState(Object.assign(
        {},
        newState,
        { pickerType: isAndroidCalendar ? null : this.state.pickerType }
      ), this.prepareUserUpdate);
    } else if (isAndroidCalendar) {
      this.setState({ pickerType: null });
    }
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
    } else if (this.props.user.pendingUser && this.props.user.pendingUser.invalidData) {
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
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Error',
          color: theme.warningColor,
        },
        detail: {
          caption: 'Field cannot be empty, please try again',
        },
        buttons: [
            { caption: 'OK' },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
      // Use input change handler to reset field and validate fields/state
      this.fieldInputChangeHandler(field, this.props.user[field]);
    } else if (field === 'email' && !constants.emailRegex.test(this.state[field])) {
      // Check if field is an email, if truthy, validate with regex
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Error',
          color: theme.warningColor,
        },
        detail: {
          caption: 'Not a valid email, please try again',
        },
        buttons: [
            { caption: 'OK' },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    }
  }

  fieldInputFocusHandler() {
    this.setState({ pickerType: null });
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
    const { user } = this.props.user;

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

  resendEmail() {
    this.props.dispatch(userActions.resendEmail());
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
    const { user, isFetching, isUpdating, resendingEmail } = this.props.user;

    // Used to determine gender
    let genderText = 'Other';
    let genderIcon = 'transgender';
    let nextGenderType = constants.gender.other;
    if (gender === constants.gender.male) {
      genderText = 'Male';
      genderIcon = 'mars';
      nextGenderType = constants.gender.female;
    } else if (gender === constants.gender.female) {
      genderText = 'Female';
      genderIcon = 'venus';
      nextGenderType = constants.gender.other;
    } else {
      nextGenderType = constants.gender.male;
    }

    return (
      <View style={styles.container}>
        {
          isFetching || isUpdating || resendingEmail ?
            <Spinner style={{ flex: 1 }} />
              :
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <KeyboardAwareScrollView contentInset={{ bottom: 0 }}>
                    <View style={styles.profileHeader}>
                      {/* To be used after implementing the photo feature
                    <TouchableOpacity>
                      <View style={styles.profileHeaderIconContainer} >
                        To be used after implementing the photo feature
                        <MaterialIcons
                          name="add-a-photo"
                          size={styles.$photoIconSize}
                          style={styles.profileHeaderIcon}
                        />
                      </View>
                    </TouchableOpacity>*/}
                      <View style={styles.profileHeaderIconContainer} >
                        <HeadingText size={1}>
                          {user.nickname ? user.nickname[0].toUpperCase() : null}
                        </HeadingText>
                      </View>
                      <HeadingText
                        size={2}
                        style={styles.profileHeaderNickname}
                      >
                        {user.nickname}
                      </HeadingText>
                    </View>
                    <ProfileFieldInput
                      edited={nickname !== user.nickname}
                      field="nickname"
                      keyboardType="default"
                      value={nickname}
                      fieldInputChangeHandler={this.fieldInputChangeHandler}
                      focusHandler={this.fieldInputFocusHandler}
                      blurHandler={this.fieldInputBlurHandler}
                      iconFont="FontAwesome"
                      iconLeftName="user"
                    />
                    <ProfileField
                      onPress={() => this.updateProfile('gender', nextGenderType, true)}
                      edited={gender !== user.gender}
                      profileData={genderText}
                      iconFont="FontAwesome"
                      iconLeftName={genderIcon}
                    />
                    <ProfileField
                      onPress={() => this.setPickerType('birthdate')}
                      edited={birthdate.getTime() !== new Date(user.birthdate).getTime()}
                      profileData={`${constants.months[birthdate.getMonth()]} ${
                        birthdate.getDate()}, ${birthdate.getFullYear()}`}
                      iconFont="MaterialIcon"
                      iconLeftName="cake"
                    />
                    { pickerType === 'birthdate' ?
                      <View style={styles.pickerContainer}>
                        <ProfilePicker
                          birthdate={birthdate}
                          pickerType={pickerType}
                          updateProfile={this.updateProfile}
                          setPickerType={this.setPickerType}
                          mode="spinner"
                        />
                      </View>
                  : null}
                    <ProfileField
                      onPress={() => this.setPickerType('height')}
                      edited={height.initialValue !== height.value}
                      profileData={this._setHeightLabel(height.value)}
                      iconFont="MaterialIcon"
                      iconLeftName="assignment"
                    />
                    { pickerType === 'height' ?
                      <View style={styles.pickerContainer}>
                        <ProfilePicker
                          height={height}
                          pickerType={pickerType}
                          updateProfile={this.updateProfile}
                          setPickerType={this.setPickerType}
                        />
                      </View>
                  : null}
                    <ProfileField
                      onPress={() => this.setPickerType('weight')}
                      edited={weight.initialValue !== weight.value}
                      profileData={this._setWeightLabel(weight.value)}
                      iconFont="FontAwesome"
                      iconLeftName="heartbeat"
                    />
                    { pickerType === 'weight' ?
                      <View style={styles.pickerContainer}>
                        <ProfilePicker
                          weight={weight}
                          pickerType={pickerType}
                          updateProfile={this.updateProfile}
                          setPickerType={this.setPickerType}
                        />
                      </View>
                  : null}
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
                    {
                    !user.isConfirmed ?
                      <View style={styles.resendEmailContainer}>
                        <SecondaryText style={styles.resendEmailText}>
                          Please check your inbox for a confirmation email.
                          Click the link in the email to confirm your email address.
                        </SecondaryText>
                        <Button
                          primary
                          text="Resend Email"
                          onPress={this.resendEmail}
                        />
                      </View> : null
                  }
                    { user.authMethod === constants.authMethods.EMAIL ?
                      <ProfileField
                        onPress={() => this.props.navigator.push(routes.changePassword)}
                        profileData="Change password"
                        iconFont="MaterialIcon"
                        iconLeftName="lock"
                      /> : null }
                    { user.facebookId ?
                      <ProfileField
                        profileData="Facebook Connected"
                        iconFont="FontAwesome"
                        iconLeftName="facebook-official"
                        disabled
                      />
                  :
                    <ProfileField
                      onPress={() => { Facebook.login(this.props); }}
                      profileData="Connect with Facebook"
                      iconFont="FontAwesome"
                      iconLeftName="facebook-official"
                    />
                  }
                    <View style={styles.signOutSpacerContainer} />
                    <View style={{ marginBottom: 0 }}>
                      <ProfileField
                        onPress={this.signOut}
                        profileData="Sign out"
                        iconFont="FontAwesome"
                        iconLeftName="power-off"
                      />
                    </View>
                  </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { auth, user } = state;
  return { auth, user };
};

export default connect(mapStateToProps)(Profile);
