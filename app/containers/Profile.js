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

const {
  height: heightConstants,
  weight: weightConstants,
} = constants;

const ProfileFieldTitle = props => (
  <View style={styles.profileFieldTitle}>
    <BodyText>{props.text}</BodyText>
    { props.edited && <SecondaryText> {props.editedText}</SecondaryText> }
  </View>
);

ProfileFieldTitle.propTypes = {
  text: PropTypes.string,
  edited: PropTypes.bool,
  editedText: PropTypes.string,
};

const ProfileField = props => (
  <TouchableOpacity style={styles.profileField} onPress={props.onPress}>
    <ProfileFieldTitle text={props.text} edited={props.edited} editedText="(edited)" />
    <View style={styles.profileFieldInfo}>
      <SecondaryText style={styles._profileText}>{props.info}</SecondaryText>
    </View>
  </TouchableOpacity>
);

ProfileField.propTypes = {
  text: PropTypes.any,
  edited: PropTypes.bool,
  onPress: PropTypes.func,
  info: PropTypes.string,
};

const ProfileFieldInput = props => (
  <View style={styles.profileField}>
    <ProfileFieldTitle
      text={props.text}
      edited={props.edited}
      editedText={props.editedText || '(edited)'}
    />
    <View style={styles.profileFieldInfo}>
      <Input
        style={styles.profileFieldInput}
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
  text: PropTypes.string,
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
    this.setPickerType = this.setPickerType.bind(this);
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
    if (this.props.user.isUpdating && !nextProps.user.isUpdating && !nextProps.user.errorMessage) {
      SensitiveInfo.setItem(constants.userStorageKey, nextProps.user.user);
      this._setHeightValue(nextProps.user.user);
      this._setWeightValue(nextProps.user.user);
    } else if (nextProps.user.errorMessage) {
      // If trying to save user profile info or access this scene
      // without having properly logged in, it'll throw an error
      Alert.alert('Error', 'Invalid user');
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

  // Sync state to user's height information
  _setHeightValue(userProps) {
    const equalsInch = userProps.heightUnitPreference === heightConstants.units.IN;
    const inchesToCentimeters = userProps.height * heightConstants.conversionValue;

    this.setState({
      height: {
        initialValue: userProps.height,
        value: Math.round(equalsInch ? userProps.height : inchesToCentimeters),
        unit: userProps.heightUnitPreference,
        label: '',
      },
    });
  }

  // Sync state to user's weight information
  _setWeightValue(userProps) {
    const { ceil, round } = Math;
    const equalsPound = userProps.weightUnitPreference === weightConstants.units.LB;
    const poundToKilogram = userProps.weight * weightConstants.conversionValue;

    this.setState({
      weight: {
        initialValue: userProps.weight,
        value: equalsPound ? round(userProps.weight) : ceil(poundToKilogram),
        unit: userProps.weightUnitPreference,
        label: '',
      },
    });
  }

  // Convert the measurement value into appropriate format
  _setHeightLabel(value) {
    const { user } = this.props.user;
    const equalsInch = user.heightUnitPreference === heightConstants.units.IN;
    const inchLabel = `${Math.floor(value / 12)}ft ${value % 12}in`;
    const centimeterLabel = `${Math.round(value * heightConstants.conversionValue)}
      ${constants.weightUnitIdToLabel[user.weightUnitPreference].toLowerCase()}`;
    return equalsInch ? inchLabel : centimeterLabel;
  }

  // Convert the measurement value into appropriate format
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

  // Upon blurring an input field, if it fails validation,
  // reset to details already on user profile
  fieldInputBlurHandler(field) {
    if (!this.state[field]) {
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
              text="Nickname"
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
              text="Gender"
              edited={gender !== user.gender}
              info={constants.gender.male === gender ? 'Male' : 'Female'}
            />
            <ProfileField
              onPress={() => this.setPickerType('birthdate')}
              text="Birthdate"
              edited={birthdate.getTime() !== new Date(user.birthdate).getTime()}
              info={`${constants.months[birthdate.getMonth()]} ${
                  birthdate.getDate()}, ${birthdate.getFullYear()}`}
            />
            <ProfileField
              onPress={() => this.setPickerType('height')}
              text="Height"
              edited={height.initialValue !== height.value}
              info={this._setHeightLabel(height.value)}
            />
            <ProfileField
              onPress={() => this.setPickerType('weight')}
              text="Height"
              edited={weight.initialValue !== weight.value}
              info={this._setWeightLabel(weight.value)}
            />
            <ProfileFieldInput
              text="Email"
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
