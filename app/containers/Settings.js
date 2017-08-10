import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Alert,
  AppState,
  Linking,
  ScrollView,
  TouchableOpacity,
  Platform,
  PushNotificationIOS,
  NativeModules,
  InteractionManager,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import Slider from 'react-native-slider';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import appActions from '../actions/app';
import authActions from '../actions/auth';
import userAction from '../actions/user';
import deviceActions from '../actions/device';
import routes from '../routes';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import BodyText from '../components/BodyText';
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

const { storageKeys, bluetoothStates } = constants;
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
    <FontAwesomeIcon name={batteryIcon} style={styles.batteryIconRed} /> :
      <FontAwesomeIcon name={batteryIcon} style={styles.batteryIconGreen} />;
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
          if (!error) {
            if (state === bluetoothStates.ON) {
              props.navigator.push(routes.deviceScan);
            } else {
              Alert.alert('Error', 'Bluetooth is off. Turn on Bluetooth before continuing.');
            }
          } else {
            Alert.alert('Error', 'Bluetooth is off. Turn on Bluetooth before continuing.');
          }
        });
      }
    }}
    style={styles.sensorSettingsContainer}
  >
    <View style={styles.sensorIconContainer}>
      <Image source={getDeviceIcon(props)} style={styles.sensorIcon} />
    </View>
    <View style={styles.sensorText}>
      <BodyText style={styles._sensorTextTitle}>BACKBONE</BodyText>
      <SecondaryText style={styles._deviceInfoText}>
        Status:
        <SecondaryText
          style={props.isConnected ? styles._deviceInfoTextGreen : styles._deviceInfoTextRed}
        >
          { props.isConnected ? ' Connected' : ' Disconnected' }
        </SecondaryText>
      </SecondaryText>
      {props.isConnected &&
        <View style={styles.batteryInfo}>
          <SecondaryText style={styles._deviceInfoText}>
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
      Alert.alert(
        'Terms of Service',
        'We could not launch your browser. You can read the Terms of Service ' + // eslint-disable-line prefer-template, max-len
        'by visiting ' + url + '.',
      );
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
      Alert.alert(
        'Privacy Policy',
        'We could not launch your browser. You can read the Privacy Policy ' + // eslint-disable-line prefer-template, max-len
        'by visiting ' + url + '.',
      );
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
      notificationsEnabled: false,
      pushNotificationEnabled: true,
      loading: true,
      sliderActive: false,
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
    // Run expensive operations after the scene is loaded
    InteractionManager.runAfterInteractions(() => {
      this.checkNotificationPermission();
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
        Alert.alert('Error', 'Your settings were NOT saved, please try again.');
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
      label: 'Posture Report',
      handler: () => this.props.navigator.push(routes.postureReport),
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
    if (isiOS) {
      Linking.openURL('app-settings:');
    } else {
      UserSettingService.launchAppSettings();
    }
  }

  signOut() {
    Alert.alert(
      'Sign Out',
      '\nAre you sure you want to sign out of your account?',
      [
        { text: 'Cancel' },
        { text: 'OK',
          onPress: () => {
            // Remove locally stored user data and reset Redux auth/user store
            this.props.dispatch(authActions.signOut());
            // Disconnect from device
            this.props.dispatch(deviceActions.disconnect());
            this.props.navigator.resetTo(routes.login);
          },
        },
      ]
    );
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
      pushNotificationEnabled,
      sliderActive,
    } = this.state;

    if (this.state.loading) {
      return <Spinner />;
    }

    return (
      <ScrollView scrollEnabled={!sliderActive}>
        <View style={styles.container}>
          <SensorSettings navigator={navigator} isConnected={isConnected} device={device} />
          <Toggle
            value={slouchNotification && pushNotificationEnabled}
            onChange={this.updateSetting}
            disabled={!pushNotificationEnabled}
            text="Slouch Notification"
            settingName="slouchNotification"
          />
          {!pushNotificationEnabled &&
            <View style={alertsStyles.notificationDisabledWarningContainer}>
              <SecondaryText style={alertsStyles._notificationDisabledWarningText}>
                Notifications are disabled in your phone's settings.
              </SecondaryText>
              <Button
                style={alertsStyles._systemSettingButton}
                primary text="Open Phone Settings"
                onPress={this.openSystemSetting}
              />
            </View>
          }
          <Toggle
            value={false}
            text="Scheduling"
            settingName="scheduledReminder"
            disabled
          />
          <View style={styles.settingsRowEmpty}>
            <BodyText />
          </View>
          <Toggle
            value={backboneVibration}
            onChange={this.updateSetting}
            text="Backbone Vibration"
            settingName="backboneVibration"
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
                  minimumTrackTintColor={'#6dc300'}
                  value={vibrationStrength}
                  onSlidingStart={this.onSlidingStart}
                  onSlidingComplete={value => this.onSlidingComplete('vibrationStrength', value)}
                />
              </View>
              <View style={alertsStyles.sliderDetails}>
                <View style={{ flex: 0.5 }}>
                  <SecondaryText style={alertsStyles._sliderDetailsText}>LOW</SecondaryText>
                </View>
                <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
                  <SecondaryText style={alertsStyles._sliderDetailsText}>HIGH</SecondaryText>
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
                  minimumTrackTintColor={'#6dc300'}
                  value={vibrationPattern}
                  onSlidingStart={this.onSlidingStart}
                  onSlidingComplete={value => this.onSlidingComplete('vibrationPattern', value)}
                />
              </View>
              <View style={alertsStyles.sliderDetails}>
                <View style={{ flex: 0.33 }}>
                  <SecondaryText style={alertsStyles._sliderDetailsText}>1</SecondaryText>
                </View>
                <View style={{ flex: 0.33, alignItems: 'center' }}>
                  <SecondaryText style={alertsStyles._sliderDetailsText}>2</SecondaryText>
                </View>
                <View style={{ flex: 0.33, alignItems: 'flex-end' }}>
                  <SecondaryText style={alertsStyles._sliderDetailsText}>3</SecondaryText>
                </View>
              </View>
            </View>
            <View style={alertsStyles.batteryLifeWarningContainer}>
              <SecondaryText style={alertsStyles._batteryLifeWarningText}>
                Increasing the vibration strength and pattern of
                your Backbone will decrease its battery life.
              </SecondaryText>
            </View>
          </View>
          <Toggle
            value={phoneVibration}
            onChange={this.updateSetting}
            text="Phone Vibration"
            settingName="phoneVibration"
          />
          <HelpSettings navigator={navigator} />
          <View style={styles.buttonContainer}>
            <Button
              primary
              text="SIGN OUT"
              onPress={this.signOut}
            />
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
