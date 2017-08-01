import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
  NativeModules,
  InteractionManager,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import appActions from '../actions/app';
import authActions from '../actions/auth';
import deviceActions from '../actions/device';
import routes from '../routes';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import arrow from '../images/settings/arrow.png';
import sensorSmall from '../images/settings/sensorSmall.png';
import deviceOrangeIcon from '../images/settings/device-orange-icon.png';
import styles from '../styles/settings';
import theme from '../styles/theme';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';
import Spinner from '../components/Spinner';
import Mixpanel from '../utils/Mixpanel';

import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const { storageKeys, bluetoothStates } = constants;
const { BluetoothService, Environment } = NativeModules;

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
              props.navigator.push(routes.deviceAdd);
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
      <Image source={sensorSmall} style={styles.sensorIcon} />
    </View>
    <View style={styles.sensorText}>
      <BodyText style={styles._sensorTextTitle}>MY BACKBONE</BodyText>
      <SecondaryText style={styles._deviceInfoText}>
        Status: { props.isConnected ? 'Connected' : 'Disconnected' }
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

const SettingsIcon = props => (
  <View style={styles.settingsLeftIcon}>
    <Icon name={props.iconName} size={styles.$settingsIconSize} color={theme.primaryColor} />
  </View>
);

SettingsIcon.propTypes = {
  iconName: PropTypes.string,
};

const SettingsText = props => (
  <View style={styles.settingsText}>
    <BodyText>{props.text}</BodyText>
  </View>
);

SettingsText.propTypes = {
  text: PropTypes.string,
};

const AccountRemindersSettings = props => (
  <View>
    <View style={styles.settingsHeader}>
      <BodyText>ACCOUNT & REMINDERS</BodyText>
    </View>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={() => props.navigator.push(routes.profile)}
    >
      <SettingsIcon iconName="person" />
      <SettingsText text="Profile" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={() => props.navigator.push(routes.changePassword)}
    >
      <SettingsIcon iconName="lock" />
      <SettingsText text="Change Password" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={() => props.navigator.push(routes.alerts)}
    >
      <SettingsIcon iconName="notifications" />
      <SettingsText text="Alerts" />
      <ArrowIcon />
    </TouchableOpacity>
  </View>
);

AccountRemindersSettings.propTypes = {
  updateNotifications: PropTypes.func,
  notificationsEnabled: PropTypes.bool,
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
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
    <View style={styles.settingsHeader}>
      <BodyText>HELP</BodyText>
    </View>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={() => {
        Mixpanel.track('openHowTo');

        props.navigator.push(routes.howTo);
      }}
    >
      <SettingsIcon iconName="live-tv" />
      <SettingsText text="How To" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={() => props.navigator.push(routes.support)}
    >
      <SettingsIcon iconName="help" />
      <SettingsText text="Support" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={openPrivacyPolicy}
    >
      <SettingsIcon iconName="description" />
      <SettingsText text="Privacy Policy" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={openTOS}
    >
      <SettingsIcon iconName="description" />
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
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      notificationsEnabled: false,
      loading: true,
    };
  }

  componentDidMount() {
    // Run expensive operations after the scene is loaded
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(deviceActions.getInfo());
      this.setState({ loading: false });
    });
  }

  componentWillUnmount() {
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
          content: (
            <View>
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={deviceOrangeIcon}
                  style={{ marginVertical: applyWidthDifference(30) }}
                />
                <BodyText
                  style={{
                    textAlign: 'center',
                    color: '#DD523B',
                    fontSize: fixedResponsiveFontSize(22),
                    fontWeight: '500',
                    marginBottom: applyWidthDifference(10),
                  }}
                >
                  Connection Lost
                </BodyText>
                <BodyText
                  style={{
                    textAlign: 'center',
                    color: '#000000',
                    fontSize: fixedResponsiveFontSize(14),
                    marginBottom: applyWidthDifference(15),
                    marginHorizontal: applyWidthDifference(12),
                  }}
                >
                  It looks like we've lost contact with your device! Try to reconnect?
                </BodyText>
              </View>
            </View>
          ),
          buttonConfigs: [
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

    if (this.state.loading) {
      return <Spinner />;
    }

    return (
      <ScrollView>
        <View style={styles.container}>
          <SensorSettings navigator={navigator} isConnected={isConnected} device={device} />
          <AccountRemindersSettings
            navigator={navigator}
            notificationsEnabled={this.state.notificationsEnabled}
            updateNotifications={this.updateNotifications}
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
  const { app, device } = state;
  return { app, device };
};

export default connect(mapStateToProps)(Settings);
