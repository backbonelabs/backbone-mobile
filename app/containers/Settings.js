import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Alert,
  Switch,
  Linking,
  Platform,
  AppState,
  ScrollView,
  TouchableOpacity,
  PushNotificationIOS,
  NativeModules,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import SvgUri from 'react-native-svg-uri';
import authActions from '../actions/auth';
import deviceActions from '../actions/device';
import routes from '../routes';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import gradientBackground20 from '../images/gradientBackground20.png';
import arrow from '../images/settings/arrow.svg';
import batteryIcon from '../images/settings/batteryIcon.png';
import sensorSmall from '../images/settings/sensorSmall.png';
import profileIcon from '../images/settings/profileIcon.svg';
import alertIcon from '../images/settings/alertIcon.svg';
import tutorialIcon from '../images/settings/tutorialIcon.svg';
import supportIcon from '../images/settings/supportIcon.svg';
import notificationsIcon from '../images/settings/notificationsIcon.svg';
import styles from '../styles/settings';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';

const { storageKeys } = constants;

const iconMap = {
  profile: profileIcon,
  alert: alertIcon,
  tutorial: tutorialIcon,
  support: supportIcon,
  notifications: notificationsIcon,
};

const ArrowIcon = () => (
  <View style={styles.arrow}>
    <SvgUri source={arrow} />
  </View>
);

const SensorSettings = props => (
  <TouchableOpacity
    onPress={() => props.navigator.push(routes.device)}
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
            Battery Life: { props.device.batteryLevel || '--' }%
          </SecondaryText>
          <Image source={batteryIcon} style={styles.batteryIcon} />
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
    batteryLevel: PropTypes.number,
  }),
};

const SettingsIcon = props => (
  <View style={styles.settingsIcon}>
    <SvgUri source={iconMap[props.iconName]} />
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
  <View style={styles.accountRemindersContainer}>
    <View style={styles.accountRemindersHeader}>
      <BodyText>ACCOUNT & REMINDERS</BodyText>
    </View>
    <TouchableOpacity
      style={styles.accountRemindersSettingContainer}
      onPress={() => props.navigator.push(routes.profile)}
    >
      <SettingsIcon iconName="profile" />
      <SettingsText text="Profile" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.accountRemindersSettingContainer}
      onPress={() => props.navigator.push(routes.changePassword)}
    >
      <SettingsIcon />
      <SettingsText text="Change Password" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.accountRemindersSettingContainer}
      onPress={() => props.navigator.push(routes.alerts)}
    >
      <SettingsIcon iconName="alert" />
      <SettingsText text="Alerts" />
      <ArrowIcon />
    </TouchableOpacity>
    {Platform.select({
      ios: (
        <View style={styles.notificationsContainer}>
          <SettingsIcon iconName="notifications" />
          <SettingsText text="Push Notifications" />
          <View style={styles.notificationsSwitch}>
            <Switch
              onValueChange={props.updateNotifications}
              value={props.notificationsEnabled}
            />
          </View>
        </View>
      ),
      android: (
        <TouchableOpacity
          style={styles.notificationsContainer}
          onPress={() => NativeModules.UserSettingService.launchAppSettings()}
        >
          <SettingsIcon iconName="notifications" />
          <SettingsText text="Push Notifications" />
          <ArrowIcon />
        </TouchableOpacity>
      ),
    })}
  </View>
);

AccountRemindersSettings.propTypes = {
  updateNotifications: PropTypes.func,
  notificationsEnabled: PropTypes.bool,
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

const HelpSettings = props => (
  <View style={styles.helpContainer}>
    <View style={styles.helpSettingsHeader}>
      <BodyText>HELP</BodyText>
    </View>
    <TouchableOpacity
      style={styles.helpSettingContainer}
      onPress={() => props.navigator.push(routes.howTo)}
    >
      <SettingsIcon iconName="tutorial" />
      <SettingsText text="How To" />
      <ArrowIcon />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.helpSettingContainer}
      onPress={() => props.navigator.push(routes.support)}
    >
      <SettingsIcon iconName="support" />
      <SettingsText text="Support" />
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
    this.state = {
      notificationsEnabled: false,
    };
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      // Check if user has enabled notifications on their iOS device
      this.checkNotificationsPermission();

      AppState.addEventListener('change', state => {
        if (state === 'active') {
          this.checkNotificationsPermission();
        }
      });
    }
  }

  componentDidMount() {
    // Add listener to run logic only after scene comes into focus
    let eventSubscriber = this.props.navigator.navigationContext.addListener('didfocus', () => {
      this.props.dispatch(deviceActions.getInfo());
      eventSubscriber.remove();
      eventSubscriber = null;
    });
  }

  componentWillUnmount() {
    // Remove listeners
    AppState.removeEventListener('change');
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

  checkNotificationsPermission() {
    // Check notification permissions
    PushNotificationIOS.checkPermissions(permissions => {
      // Update notificationsEnabled to true if permissions enabled
      if (!!permissions.alert !== this.state.notificationsEnabled) {
        // Specifically set to boolean due to Switch prop validation
        this.setState({ notificationsEnabled: !!permissions.alert });
      }
    });
  }

  @autobind
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
            this.props.navigator.resetTo(routes.welcome);
          },
        },
      ]
    );
  }

  @autobind
  updateNotifications(value) {
    this.setState({ notificationsEnabled: value }, () => {
      // Linking scheme for iOS only
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      }
    });
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

    return (
      <ScrollView>
        <Image source={gradientBackground20} style={styles.backgroundImage}>
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
        </Image>
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
