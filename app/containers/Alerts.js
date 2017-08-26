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
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import Slider from 'react-native-slider';
import userAction from '../actions/user';
import styles from '../styles/alerts';
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
    } = this.state;

    const newSettings = {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
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
    } = this.state;

    return (
      <View style={styles.container}>
        <Toggle
          value={backboneVibration}
          onChange={this.updateSetting}
          text="Backbone Vibration"
          settingName="backboneVibration"
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
                minimumTrackTintColor={'#6dc300'}
                value={vibrationStrength}
                onSlidingComplete={value => this.onSlidingComplete('vibrationStrength', value)}
              />
            </View>
            <View style={styles.sliderDetails}>
              <View style={{ flex: 0.5 }}>
                <SecondaryText style={styles._sliderDetailsText}>LOW</SecondaryText>
              </View>
              <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
                <SecondaryText style={styles._sliderDetailsText}>HIGH</SecondaryText>
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
                minimumTrackTintColor={'#6dc300'}
                value={vibrationPattern}
                onSlidingComplete={value => this.onSlidingComplete('vibrationPattern', value)}
              />
            </View>
            <View style={styles.sliderDetails}>
              <View style={{ flex: 0.33 }}>
                <SecondaryText style={styles._sliderDetailsText}>1</SecondaryText>
              </View>
              <View style={{ flex: 0.33, alignItems: 'center' }}>
                <SecondaryText style={styles._sliderDetailsText}>2</SecondaryText>
              </View>
              <View style={{ flex: 0.33, alignItems: 'flex-end' }}>
                <SecondaryText style={styles._sliderDetailsText}>3</SecondaryText>
              </View>
            </View>
          </View>
        </View>
        <Toggle
          value={phoneVibration}
          onChange={this.updateSetting}
          text="Phone Vibration"
          settingName="phoneVibration"
        />
        <Toggle
          value={slouchNotification && pushNotificationEnabled}
          onChange={this.updateSetting}
          disabled={!pushNotificationEnabled}
          text="Slouch Notification"
          settingName="slouchNotification"
        />
        {!pushNotificationEnabled ?
          <View style={styles.notificationDisabledWarningContainer}>
            <SecondaryText style={styles._notificationDisabledWarningText}>
              Notifications are disabled in your phone's settings.
            </SecondaryText>
            <Button
              style={styles._systemSettingButton}
              primary text="Open Phone Settings"
              onPress={this.openSystemSetting}
            />
          </View>
          : <Text />
        }
        <View style={styles.batteryLifeWarningContainer}>
          <SecondaryText style={styles._batteryLifeWarningText}>
            Increasing the vibration strength and pattern of
            your Backbone will decrease its battery life
          </SecondaryText>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(Alerts);
