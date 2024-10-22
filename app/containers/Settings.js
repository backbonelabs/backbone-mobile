import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  AppState,
  Linking,
  ScrollView,
  TouchableOpacity,
  Platform,
  PushNotificationIOS,
  NativeModules,
  InteractionManager,
  Picker,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import moment from 'moment';
import Slider from 'react-native-slider';
import DateTimePicker from 'react-native-modal-datetime-picker';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import appActions from '../actions/app';
import authActions from '../actions/auth';
import userAction from '../actions/user';
import deviceActions from '../actions/device';
import routes from '../routes';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import SecondaryText from '../components/SecondaryText';
import arrow from '../images/settings/arrow.png';
import deviceOrangeIcon from '../images/settings/device-orange-icon.png';
import deviceErrorIcon from '../images/settings/device-error-icon.png';
import deviceLowBatteryIcon from '../images/settings/device-low-battery-icon.png';
import styles from '../styles/settings';
import alertsStyles from '../styles/alerts';
import theme from '../styles/theme';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';
import Spinner from '../components/Spinner';
import Mixpanel from '../utils/Mixpanel';

const { storageKeys, bluetoothStates, notificationTypes } = constants;
const { BluetoothService, Environment, NotificationService, UserSettingService } = NativeModules;

const isiOS = Platform.OS === 'ios';

const ArrowIcon = () => (
  <View style={styles.settingsRightIcon}>
    <Image source={arrow} style={styles.arrowIcon} />
  </View>
);

const getBatteryIcon = (batteryLevel) => {
  let batteryIcon;
  if (batteryLevel >= 90) {
    batteryIcon = 'battery-full';
  } else if (batteryLevel >= 75) {
    batteryIcon = 'battery-three-quarters';
  } else if (batteryLevel >= 50) {
    batteryIcon = 'battery-half';
  } else if (batteryLevel >= 25) {
    batteryIcon = 'battery-quarter';
  } else {
    batteryIcon = 'battery-empty';
  }
  return batteryLevel < 25 ?
    <FontAwesomeIcon name={batteryIcon} style={styles.red} /> :
      <FontAwesomeIcon name={batteryIcon} style={styles.green} />;
};

const getDeviceIcon = (props) => {
  let deviceIcon;
  if (!props.isConnected) {
    deviceIcon = deviceErrorIcon;
  } else if (props.device.batteryLevel < 25) {
    deviceIcon = deviceLowBatteryIcon;
  } else {
    deviceIcon = deviceOrangeIcon;
  }

  return deviceIcon;
};

const SensorSettings = props => (
  <TouchableOpacity
    onPress={() => {
      // If there's any previously paired device, proceed to the device setting,
      // else, redirect to the device scanner
      if (props.device.firmwareVersion) {
        props.navigator.push(routes.device);
      } else {
        BluetoothService.getState((error, { state }) => {
          if (!error && (state === bluetoothStates.ON)) {
            return props.navigator.push(routes.deviceScan);
          }
          return this.props.dispatch(appActions.showPartialModal({
            title: {
              caption: 'Error',
              color: theme.warningColor,
            },
            detail: {
              caption: 'Bluetooth is off. Turn on Bluetooth before continuing.',
            },
            buttons: [
              {
                caption: 'OK',
                onPress: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              },
            ],
            backButtonHandler: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          }));
        });
      }
    }}
    style={styles.sensorSettingsContainer}
  >
    <View style={styles.sensorIconContainer}>
      <Image source={getDeviceIcon(props)} style={styles.sensorIcon} />
    </View>
    <View style={styles.sensorText}>
      <HeadingText size={3} style={styles.sensorTextTitle}>BACKBONE</HeadingText>
      <View style={styles.deviceConnectionStatus}>
        <BodyText>Status:</BodyText>
        <BodyText
          style={props.isConnected ? styles.green : styles.red}
        >
          { props.isConnected ? ' Connected' : ' Disconnected' }
        </BodyText>
      </View>
      {props.isConnected &&
        <View style={styles.batteryInfo}>
          <SecondaryText>
            Battery Life: { props.device.batteryLevel || '--' }%{' '}
          </SecondaryText>
          {getBatteryIcon(props.device.batteryLevel)}
        </View>
      }
    </View>
    <ArrowIcon />
  </TouchableOpacity>
);

SensorSettings.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
  isConnected: PropTypes.bool,
  device: PropTypes.shape({
    firmwareVersion: PropTypes.string,
    batteryLevel: PropTypes.number,
  }),
};

const SettingsText = props => (
  <View style={styles.settingsText}>
    <BodyText>{props.text}</BodyText>
  </View>
);

SettingsText.propTypes = {
  text: PropTypes.string,
};

const openTOS = () => {
  Mixpanel.track('openTOS');

  const url = `${Environment.WEB_SERVER_URL}/legal/terms`;
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
      throw new Error();
    })
    .catch(() => {
      // This catch handler will handle rejections from Linking.openURL as well
      // as when the user's phone doesn't have any apps to open the URL
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Terms of Service',
          color: theme.warningColor,
        },
        detail: {
          caption: 'We could not launch your browser. You can read the Terms of Service ' + // eslint-disable-line prefer-template, max-len
          'by visiting ' + url + '.',
        },
        buttons: [
          {
            caption: 'OK',
            onPress: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    });
};

const openPrivacyPolicy = () => {
  Mixpanel.track('openPrivacyPolicy');

  const url = `${Environment.WEB_SERVER_URL}/legal/privacy`;
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
      throw new Error();
    })
    .catch(() => {
      // This catch handler will handle rejections from Linking.openURL as well
      // as when the user's phone doesn't have any apps to open the URL
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Privacy Policy',
          color: theme.warningColor,
        },
        detail: {
          caption: 'We could not launch your browser. You can read the Privacy Policy ' + // eslint-disable-line prefer-template, max-len
          'by visiting ' + url + '.',
        },
        buttons: [
          {
            caption: 'OK',
            onPress: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    });
};

const HelpSettings = props => (
  <View>
    <View style={styles.settingsRowEmpty}>
      <BodyText />
    </View>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={() => props.navigator.push(routes.support)}
    >
      <SettingsText text="Support" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={openPrivacyPolicy}
    >
      <SettingsText text="Privacy Policy" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={openTOS}
    >
      <SettingsText text="Terms of Service" />
      <ArrowIcon />
    </TouchableOpacity>
  </View>
);

HelpSettings.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

class Settings extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      push: PropTypes.func,
      navigationContext: PropTypes.shape({
        addListener: PropTypes.func,
      }),
    }),
    app: PropTypes.shape({
      config: PropTypes.object,
    }),
    device: PropTypes.shape({
      isConnected: PropTypes.bool,
    }),
    user: PropTypes.shape({
      user: PropTypes.shape({
        _id: PropTypes.string,
        settings: PropTypes.shape({
          slouchTimeThreshold: PropTypes.number,
          postureThreshold: PropTypes.number,
          backboneVibration: PropTypes.bool,
          slouchNotification: PropTypes.bool,
          dailyReminderNotification: PropTypes.bool,
          dailyReminderTime: PropTypes.number,
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
      dailyReminderNotification,
      dailyReminderTime,
      slouchTimeThreshold,
    } = this.props.user.user.settings;

    // Maintain settings in component state because the user settings object
    // will change back and forth during the asynchronous action for updating
    // the user settings in the backend, and that will cause a flicker/lag in
    // the UI when modifying each setting
    this.state = {
      notificationsEnabled: false,
      pushNotificationEnabled: true,
      timePickerActive: false,
      use24HourFormat: false,
      loading: true,
      sliderActive: false,
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      dailyReminderNotification,
      dailyReminderTime,
      slouchTimeThreshold,
      displayPicker: false,
    };

    // Schedule a daily reminder if it's enabled but not yet scheduled in the system
    if (dailyReminderNotification) {
      NotificationService.hasScheduledNotification(notificationTypes.DAILY_REMINDER,
        (error, { onSchedule }) => {
          if (!error && !onSchedule) {
            const hour = Math.floor(dailyReminderTime / 60);
            const minute = dailyReminderTime % 60;

            NotificationService.scheduleNotification({
              notificationType: notificationTypes.DAILY_REMINDER,
              scheduledHour: hour,
              scheduledMinute: minute,
            });
          } else if (error) {
            this.props.dispatch(appActions.showPartialModal({
              title: {
                caption: 'Error',
                color: theme.warningColor,
              },
              detail: {
                caption: error,
              },
              buttons: [
                {
                  caption: 'OK',
                  onPress: () => {
                    this.props.dispatch(appActions.hidePartialModal());
                  },
                },
              ],
              backButtonHandler: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            }));
          }
        });
    }

    // Debounce state update to smoothen quick slider value changes
    this.updateSetting = debounce(this.updateSetting, 150);
    // Debounce user profile update to limit the number of API requests
    this.updateUserSettingsFromState = debounce(this.updateUserSettingsFromState, 1000);
  }

  componentDidMount() {
    // Run expensive operations after the scene is loaded
    InteractionManager.runAfterInteractions(() => {
      this.checkNotificationPermission();
      this.checkDeviceClockFormat();
      AppState.addEventListener('change', this.handleAppState);

      this.props.dispatch(deviceActions.getInfo());
      this.setState({ loading: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    // Check if errorMessage is present in nextProps
    if (!this.props.user.errorMessage && nextProps.user.errorMessage) {
      // Check if API error prevented settings update
      if (this.props.user.user.settings === nextProps.user.user.settings) {
        this.props.dispatch(appActions.showPartialModal({
          title: {
            caption: 'Error',
            color: theme.warningColor,
          },
          detail: {
            caption: 'Your settings were NOT saved, please try again.',
          },
          buttons: [
            {
              caption: 'OK',
              onPress: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      }
    }
  }

  componentWillUnmount() {
    // Remove all listeners
    AppState.removeEventListener('change', this.handleAppState);
  }

  onSlidingStart() {
    if (isiOS) {
      // Disable scrolling when slider is active, only relevant in iOS
      // as the scrollview is still scrollable when slider is active without this tweak
      this.setState({ sliderActive: true });
    }
  }

  onSlidingComplete(field, value) {
    if (isiOS) {
      // Enable scrolling when slider is inactive, only relevant in iOS
      // as the scrollview is still scrollable when slider is active without this tweak
      this.setState({ sliderActive: false });
    }

    // Update value from slider-type settings only after the user has finished sliding
    this.updateSetting(field, value);
  }

  onTimeChange(date) {
    const time = moment(date);
    const hour = time.hour();
    const minute = time.minute();
    const scheduleInMinutes = (hour * 60) + minute;

    this.setState({
      dailyReminderTime: scheduleInMinutes,
      dailyReminderNotification: true,
      timePickerActive: false,
    });

    NotificationService.scheduleNotification({
      notificationType: notificationTypes.DAILY_REMINDER,
      scheduledHour: hour,
      scheduledMinute: minute,
    });

    this.updateUserSettingsFromState();
  }

  onPickerValueChange(itemValue) {
    this.setState({ slouchTimeThreshold: itemValue });
    this.updateUserSettingsFromState();
  }

  getDevMenu() {
    const items = [{
      label: 'Delete access token from local storage',
      handler: () => SensitiveInfo.deleteItem(storageKeys.ACCESS_TOKEN),
    }, {
      label: 'Delete user from local storage',
      handler: () => SensitiveInfo.deleteItem(storageKeys.USER),
    }, {
      label: 'Disconnect device',
      handler: () => this.props.dispatch(deviceActions.disconnect()),
    }, {
      label: 'Forget device',
      handler: () => this.props.dispatch(deviceActions.forget()),
    }, {
      label: 'Partial modal example',
      handler: () => {
        this.props.dispatch(appActions.showPartialModal({
          topView: (
            <Image source={deviceOrangeIcon} />
          ),
          title: {
            caption: 'Connection Lost',
            color: theme.warningColor,
          },
          detail: {
            caption: "It looks like we've lost contact with your device! Try to reconnect?",
          },
          buttons: [
            { caption: 'CANCEL' },
            { caption: 'OKAY' },
          ],
        }));
      },
    }, {
      label: 'Sign Out',
      handler: () => this.signOut(),
    }];

    return (
      <View style={styles.devMenu}>
        <BodyText>Dev menu:</BodyText>
        {items.map((item, key) => (
          <TouchableOpacity key={key} style={styles.devMenuItem} onPress={item.handler}>
            <SecondaryText>{item.label}</SecondaryText>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  handleAppState(state) {
    if (state === 'active') {
      this.checkNotificationPermission();
      this.checkDeviceClockFormat();
    }
  }

  checkNotificationPermission() {
    if (isiOS) {
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

  checkDeviceClockFormat() {
    UserSettingService.getDeviceClockFormat((error, { is24Hour }) => {
      if (!error) {
        this.setState({ use24HourFormat: is24Hour });
      } else {
        this.setState({ use24HourFormat: false });
      }
    });
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
      dailyReminderNotification,
      dailyReminderTime,
      slouchTimeThreshold,
    } = this.state;

    const newSettings = {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      dailyReminderNotification,
      dailyReminderTime,
      slouchTimeThreshold,
    };

    this.props.dispatch(userAction.updateUserSettings({
      _id,
      settings: Object.assign({}, settings, newSettings),
    }));
  }

  openSystemSetting() {
    if (isiOS) {
      Linking.openURL('app-settings:');
    } else {
      UserSettingService.launchAppSettings();
    }
  }

  toggleReminder(field, value) {
    let newSettings;

    if (value) {
      const { dailyReminderTime } = this.state;
      let hour;
      let minute;

      // Check for new users or existing users with dailyReminderTime not yet set
      if (dailyReminderTime === undefined || dailyReminderTime === -1) {
        // If it hasn't been set before, use '10.00 AM' as the default
        hour = 10;
        minute = 0;
        newSettings = {
          dailyReminderTime: (hour * 60) + minute,
          dailyReminderNotification: value,
        };
      } else {
        // Else, use the currently set time
        hour = Math.floor(dailyReminderTime / 60);
        minute = dailyReminderTime % 60;
        newSettings = { dailyReminderNotification: value };
      }

      NotificationService.scheduleNotification({
        notificationType: notificationTypes.DAILY_REMINDER,
        scheduledHour: hour,
        scheduledMinute: minute,
      });
    } else {
      newSettings = { dailyReminderNotification: value };

      NotificationService.unscheduleNotification(notificationTypes.DAILY_REMINDER);
    }

    this.setState({ ...newSettings });
    this.updateUserSettingsFromState();
  }

  toggleDisplayPicker() {
    const { displayPicker } = this.state;
    this.setState({ displayPicker: !displayPicker });
  }

  signOut() {
    this.props.dispatch(appActions.showPartialModal({
      title: {
        caption: 'Sign Out',
      },
      detail: {
        caption: 'Are you sure you want to sign out of your account?',
      },
      buttons: [
        {
          caption: 'Cancel',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        },
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
        },
      ],
      backButtonHandler: () => {
        this.props.dispatch(appActions.hidePartialModal());
      },
    }));
  }

  render() {
    const {
      device: {
        isConnected,
        device,
      },
      navigator,
      app: { config },
    } = this.props;

    const {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
      slouchNotification,
      dailyReminderNotification,
      dailyReminderTime,
      pushNotificationEnabled,
      sliderActive,
      timePickerActive,
      use24HourFormat,
      slouchTimeThreshold,
      displayPicker,
    } = this.state;

    if (this.state.loading) {
      return <Spinner />;
    }

    const currentTime = new Date();
    let reminderTime = '';

    if (dailyReminderNotification) {
      // Build the time text based on local device clock setting
      const inHour = Math.floor(dailyReminderTime / 60);
      let reminderHour = inHour;
      const reminderMinute = dailyReminderTime % 60;
      let amOrPm = '';

      currentTime.setHours(reminderHour, reminderMinute);

      if (!use24HourFormat) {
        amOrPm = (inHour < 12 ? 'AM' : 'PM');
        reminderHour = (inHour % 12 === 0 ? 12 : inHour % 12); // Convert to 12-hour format
      }

      reminderTime = `${reminderHour < 10 ? '0' : ''}${reminderHour}:` +
      `${reminderMinute < 10 ? '0' : ''}${reminderMinute}${amOrPm}`;
    }

    // The Slouch Feedback Delay setting will allow for a range from 3 to 15 seconds
    const slouchTimeThresholdRange = Array.from(new Array(13), (_, index) => (
      <Picker.Item key={index} label={(index + 3).toString()} value={index + 3} />
    ));

    return (
      <ScrollView scrollEnabled={!sliderActive} >
        <View style={styles.container}>
          <SensorSettings navigator={navigator} isConnected={isConnected} device={device} />
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
            value={dailyReminderNotification && pushNotificationEnabled}
            disabled={!pushNotificationEnabled}
            text="Daily Reminder"
            settingName="dailyReminderNotification"
            onChange={this.toggleReminder}
            onTintColor={theme.lightBlue200}
            tintColor={theme.grey300}
            thumbTintColor={theme.lightBlue500}
          />
          {
            pushNotificationEnabled && dailyReminderNotification &&
            <View>
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => { this.setState({ timePickerActive: true }); }}
              >
                <View style={styles.settingsLeftText}>
                  <BodyText>Reminder Time</BodyText>
                </View>
                <View style={styles.settingsRightText}>
                  <BodyText>{reminderTime}</BodyText>
                </View>
              </TouchableOpacity>
              <DateTimePicker
                mode={'time'}
                date={currentTime}
                isVisible={timePickerActive}
                onConfirm={this.onTimeChange}
                onCancel={() => { this.setState({ timePickerActive: false }); }}
                is24Hour={use24HourFormat}
                titleIOS={'Reminder Time'}
                confirmTextIOS={'Set'}
              />
            </View>
          }
          {
            !pushNotificationEnabled &&
            <View style={alertsStyles.notificationDisabledWarningContainer}>
              <BodyText style={alertsStyles.notificationDisabledWarningText}>
                Notifications are disabled in your phone's settings.
              </BodyText>
              <Button
                style={alertsStyles.systemSettingButton}
                primary text="Open Phone Settings"
                onPress={this.openSystemSetting}
              />
            </View>
          }
          <View style={styles.settingsRowEmpty}>
            <BodyText />
          </View>
          <Toggle
            value={backboneVibration}
            onChange={this.updateSetting}
            text="BACKBONE Vibration"
            settingName="backboneVibration"
            tintColor={theme.grey300}
            onTintColor={theme.lightBlue200}
            thumbTintColor={theme.lightBlue500}
          />
          <View style={alertsStyles.vibrationSettingsContainer}>
            <View style={alertsStyles.sliderContainer}>
              <View style={alertsStyles.sliderText}>
                <BodyText>Vibration Strength</BodyText>
              </View>
              <View style={alertsStyles.slider}>
                <Slider
                  minimumValue={20}
                  maximumValue={100}
                  step={10}
                  thumbStyle={alertsStyles.sliderThumb}
                  trackStyle={alertsStyles.sliderTrack}
                  minimumTrackTintColor={theme.lightBlue500}
                  value={vibrationStrength}
                  onSlidingStart={this.onSlidingStart}
                  onSlidingComplete={value => this.onSlidingComplete('vibrationStrength', value)}
                />
              </View>
              <View style={alertsStyles.sliderDetails}>
                <View style={{ flex: 0.5 }}>
                  <SecondaryText style={alertsStyles.sliderDetailsText}>LOW</SecondaryText>
                </View>
                <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
                  <SecondaryText style={alertsStyles.sliderDetailsText}>HIGH</SecondaryText>
                </View>
              </View>
            </View>
          </View>
          <View style={alertsStyles.vibrationSettingsContainer}>
            <View style={alertsStyles.sliderContainer}>
              <View style={alertsStyles.sliderText}>
                <BodyText>Vibration Pattern (Buzzes)</BodyText>
              </View>
              <View style={alertsStyles.slider}>
                <Slider
                  minimumValue={1}
                  maximumValue={3}
                  step={1}
                  thumbStyle={alertsStyles.sliderThumb}
                  trackStyle={alertsStyles.sliderTrack}
                  minimumTrackTintColor={theme.lightBlue500}
                  value={vibrationPattern}
                  onSlidingStart={this.onSlidingStart}
                  onSlidingComplete={value => this.onSlidingComplete('vibrationPattern', value)}
                />
              </View>
              <View style={alertsStyles.sliderDetails}>
                <View style={{ flex: 0.33 }}>
                  <SecondaryText style={alertsStyles.sliderDetailsText}>1</SecondaryText>
                </View>
                <View style={{ flex: 0.33, alignItems: 'center' }}>
                  <SecondaryText style={alertsStyles.sliderDetailsText}>2</SecondaryText>
                </View>
                <View style={{ flex: 0.33, alignItems: 'flex-end' }}>
                  <SecondaryText style={alertsStyles.sliderDetailsText}>3</SecondaryText>
                </View>
              </View>
            </View>
            <View style={alertsStyles.batteryLifeWarningContainer}>
              <SecondaryText>
                Increasing the vibration strength and pattern of
                your BACKBONE will decrease its battery life.
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
          <HelpSettings navigator={navigator} />
          <View style={styles.settingsRowEmpty}>
            <BodyText />
          </View>
        </View>
        {config.DEV_MODE && this.getDevMenu()}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { app, device, user } = state;
  return { app, device, user };
};

export default connect(mapStateToProps)(Settings);
