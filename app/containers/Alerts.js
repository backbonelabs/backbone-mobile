import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  AppState,
  Linking,
  Platform,
  PushNotificationIOS,
  NativeModules,
  Text,
  Picker,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import Slider from 'react-native-slider';
import userAction from '../actions/user';
import styles from '../styles/alerts';
import theme from '../styles/theme';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import SecondaryText from '../components/SecondaryText';

const { NotificationService, UserSettingService } = NativeModules;

class Alerts extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    user: PropTypes.shape({
      user: PropTypes.shape({
        _id: PropTypes.string,
        settings: PropTypes.shape({
          slouchTimeThreshold: PropTypes.number,
          postureThreshold: PropTypes.number,
          backboneVibration: PropTypes.bool,
          slouchNotification: PropTypes.bool,
          phoneVibration: PropTypes.bool,
          vibrationStrength: PropTypes.number,
          vibrationPattern: PropTypes.number,
        }),
      }),
      errorMessage: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    autobind(this);
    const {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      slouchTimeThreshold,
    } = this.props.user.user.settings;

    // Maintain settings in component state because the user settings object
    // will change back and forth during the asynchronous action for updating
    // the user settings in the backend, and that will cause a flicker/lag in
    // the UI when modifying each setting
    this.state = {
      pushNotificationEnabled: true,
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      slouchTimeThreshold,
      displayPicker: false,
    };

    // Debounce state update to smoothen quick slider value changes
    this.updateSetting = debounce(this.updateSetting, 150);
    // Debounce user profile update to limit the number of API requests
    this.updateUserSettingsFromState = debounce(this.updateUserSettingsFromState, 1000);
  }

  componentDidMount() {
    this.checkNotificationPermission();
    AppState.addEventListener('change', this.handleAppState);
  }

  componentWillReceiveProps(nextProps) {
    // Check if errorMessage is present in nextProps
    if (!this.props.user.errorMessage && nextProps.user.errorMessage) {
      // Check if API error prevented settings update
      if (this.props.user.user.settings === nextProps.user.user.settings) {
        Alert.alert('Error', 'Your settings were NOT saved, please try again.');
      }
    }
  }

  componentWillUnmount() {
    // Remove listeners
    AppState.removeEventListener('change', this.handleAppState);
  }

  onSlidingComplete(field, value) {
    // Update value from slider-type settings only after the user has finished sliding
    this.updateSetting(field, value);
  }

  onPickerValueChange(itemValue) {
    this.setState({ slouchTimeThreshold: itemValue },
    this.updateUserSettingsFromState);
  }

  toggleDisplayPicker() {
    const { displayPicker } = this.state;
    this.setState({ displayPicker: !displayPicker });
  }

  checkNotificationPermission() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.checkPermissions(permissions => {
        // Update pushNotificationEnabled to true if permissions enabled
        this.setState({ pushNotificationEnabled: !!permissions.alert });
      });
    } else {
      NotificationService.isPushNotificationEnabled((error, { notificationEnabled }) => {
        this.setState({ pushNotificationEnabled: notificationEnabled });
      });
    }
  }

  updateSetting(field, value) {
    this.setState({ [field]: value });
    this.updateUserSettingsFromState();
  }

  /**
   * Update user settings in the backend
   */
  updateUserSettingsFromState() {
    const { _id, settings } = this.props.user.user;

    // Filter through states to exclude non-user-setting fields
    const {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      slouchTimeThreshold,
    } = this.state;

    const newSettings = {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      slouchTimeThreshold,
    };

    this.props.dispatch(userAction.updateUserSettings({
      _id,
      settings: Object.assign({}, settings, newSettings),
    }));
  }

  openSystemSetting() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      UserSettingService.launchAppSettings();
    }
  }

  handleAppState(state) {
    if (state === 'active') {
      this.checkNotificationPermission();
    }
  }

  render() {
    const {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      pushNotificationEnabled,
      slouchTimeThreshold,
      displayPicker,
    } = this.state;

    // The Slouch Feedback Delay setting will allow for a range from 3 to 15 seconds
    const slouchTimeThresholdRange = Array.from(new Array(13), (_, index) => (
      <Picker.Item key={index} label={(index + 3).toString()} value={index + 3} />
    ));

    return (
      <ScrollView scrollEnabled={displayPicker} >
        <View style={styles.container}>
          <Toggle
            value={slouchNotification && pushNotificationEnabled}
            onChange={this.updateSetting}
            disabled={!pushNotificationEnabled}
            text="Slouch Notification"
            settingName="slouchNotification"
            tintColor={theme.grey300}
            onTintColor={theme.lightBlue200}
            thumbTintColor={theme.lightBlue500}
          />
          <Toggle
            value={backboneVibration}
            onChange={this.updateSetting}
            text="BACKBONE Vibration"
            settingName="backboneVibration"
            tintColor={theme.grey300}
            onTintColor={theme.lightBlue200}
            thumbTintColor={theme.lightBlue500}
          />
          <View style={styles.vibrationSettingsContainer}>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderText}>
                <BodyText>Vibration Strength</BodyText>
              </View>
              <View style={styles.slider}>
                <Slider
                  minimumValue={20}
                  maximumValue={100}
                  step={10}
                  thumbStyle={styles.sliderThumb}
                  trackStyle={styles.sliderTrack}
                  minimumTrackTintColor={theme.lightBlue500}
                  value={vibrationStrength}
                  onSlidingComplete={value => this.onSlidingComplete('vibrationStrength', value)}
                />
              </View>
              <View style={styles.sliderDetails}>
                <View style={{ flex: 0.5 }}>
                  <SecondaryText style={styles.sliderDetailsText}>LOW</SecondaryText>
                </View>
                <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
                  <SecondaryText style={styles.sliderDetailsText}>HIGH</SecondaryText>
                </View>
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderText}>
                <BodyText>Vibration Pattern (Buzzes)</BodyText>
              </View>
              <View style={styles.slider}>
                <Slider
                  minimumValue={1}
                  maximumValue={3}
                  step={1}
                  thumbStyle={styles.sliderThumb}
                  trackStyle={styles.sliderTrack}
                  minimumTrackTintColor={theme.lightBlue500}
                  value={vibrationPattern}
                  onSlidingComplete={value => this.onSlidingComplete('vibrationPattern', value)}
                />
              </View>
              <View style={styles.sliderDetails}>
                <View style={{ flex: 0.33 }}>
                  <SecondaryText style={styles.sliderDetailsText}>1</SecondaryText>
                </View>
                <View style={{ flex: 0.33, alignItems: 'center' }}>
                  <SecondaryText style={styles.sliderDetailsText}>2</SecondaryText>
                </View>
                <View style={{ flex: 0.33, alignItems: 'flex-end' }}>
                  <SecondaryText style={styles.sliderDetailsText}>3</SecondaryText>
                </View>
              </View>
            </View>
            <View style={styles.batteryLifeWarningContainer}>
              <SecondaryText>
                Increasing the vibration strength and pattern of
                your BACKBONE will decrease its battery life
              </SecondaryText>
            </View>
          </View>
          <Toggle
            value={phoneVibration}
            onChange={this.updateSetting}
            text="Phone Vibration"
            settingName="phoneVibration"
            tintColor={theme.grey300}
            onTintColor={theme.lightBlue200}
            thumbTintColor={theme.lightBlue500}
          />
          {!pushNotificationEnabled ?
            <View style={styles.notificationDisabledWarningContainer}>
              <BodyText style={styles.notificationDisabledWarningText}>
              Notifications are disabled in your phone's settings.
              </BodyText>
              <Button
                style={styles.systemSettingButton}
                primary text="Open Phone Settings"
                onPress={this.openSystemSetting}
              />
            </View>
          : <Text />
        }
          <TouchableOpacity
            style={styles.slouchContainer}
            onPress={this.toggleDisplayPicker}
          >
            <BodyText>
                Slouch Feedback Delay
            </BodyText>
            <BodyText>
              {slouchTimeThreshold} seconds
            </BodyText>
          </TouchableOpacity>
          {displayPicker ?
            <Picker
              selectedValue={slouchTimeThreshold}
              onValueChange={this.onPickerValueChange}
              style={styles.picker}
            >
              {slouchTimeThresholdRange}
            </Picker>
          : null
          }
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(Alerts);
