import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Switch,
  Linking,
  Platform,
  AppState,
  ScrollView,
  TouchableOpacity,
  PushNotificationIOS,
} from 'react-native';
import { connect } from 'react-redux';
import SvgUri from 'react-native-svg-uri';
import SensitiveInfo from '../utils/SensitiveInfo';
import constants from '../utils/constants';
import styles from '../styles/settings';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import gradientBackground20 from '../images/gradientBackground20.png';
import arrow from '../images/settings/arrow.svg';
import batteryIcon from '../images/settings/batteryIcon.png';
import sensorSmall from '../images/settings/sensorSmall.png';
import profileIcon from '../images/settings/profileIcon.svg';
import alertIcon from '../images/settings/alertIcon.svg';
import tutorialIcon from '../images/settings/tutorialIcon.svg';
import supportIcon from '../images/settings/supportIcon.svg';
import notificationsIcon from '../images/settings/notificationsIcon.svg';
import SecondaryText from '../components/SecondaryText';

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

const SensorSettings = () => (
  <View style={styles.sensorSettingsContainer}>
    <View style={styles.sensorIconContainer}>
      <Image source={sensorSmall} style={styles.sensorIcon} />
    </View>
    <View style={styles.sensorText}>
      <BodyText>MY BACKBONE</BodyText>
      <View style={styles.batteryInfo}>
        <Image source={batteryIcon} style={styles.batteryIcon} />
        <SecondaryText style={styles._batteryText}>Battery: 100%</SecondaryText>
      </View>
      <SecondaryText style={styles._batteryText}>About 10 days</SecondaryText>
    </View>
    <ArrowIcon />
  </View>
);

const SettingsIcon = props => (
  <View style={styles.settingsIcon}>
    <SvgUri source={iconMap[props.iconName]} />
  </View>
);

const SettingsText = props => (
  <View style={styles.settingsText}>
    <BodyText>{props.text}</BodyText>
  </View>
);

const AccountRemindersSettings = props => (
  <View style={styles.accountRemindersContainer}>
    <View style={styles.accountRemindersHeader}>
      <BodyText>ACCOUNT & REMINDERS</BodyText>
    </View>
    <View style={styles.accountRemindersSettingContainer}>
      <SettingsIcon iconName="profile" />
      <SettingsText text="Profile" />
      <ArrowIcon />
    </View>
    <View style={styles.accountRemindersSettingContainer}>
      <SettingsIcon iconName="alert" />
      <SettingsText text="Alerts" />
      <ArrowIcon />
    </View>
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
  </View>
);

const HelpSettings = () => (
  <View style={styles.helpContainer}>
    <View style={styles.helpSettingsHeader}>
      <BodyText>HELP</BodyText>
    </View>
    <View style={styles.helpSettingContainer}>
      <SettingsIcon iconName="tutorial" />
      <SettingsText text="How To Use" />
      <ArrowIcon />
    </View>
    <View style={styles.helpSettingContainer}>
      <SettingsIcon iconName="support" />
      <SettingsText text="Support" />
      <ArrowIcon />
    </View>
  </View>
);

class Settings extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      popToTop: PropTypes.func,
    }),
    app: PropTypes.shape({
      config: PropTypes.object,
    }),
  };

  constructor() {
    super();
    this.state = {
      notificationsEnabled: false,
    };

    this.updateNotifications = this.updateNotifications.bind(this);
  }

  componentWillMount() {
    this.checkNotificationsPermission();
    // Check if user has enabled notifications on their iOS device
    if (Platform.OS === 'ios') {
      AppState.addEventListener('change', state => {
        if (state === 'active') {
          this.checkNotificationsPermission();
        }
      });
    }
  }

  componentWillUnmount() {
    // Remove app state event listener
    AppState.removeEventListener('change');
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

  updateNotifications(value) {
    this.setState({ notificationsEnabled: value }, () => {
      // Linking scheme for iOS only
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      }
    });
  }

  render() {
    return (
      <ScrollView>
        <Image source={gradientBackground20} style={styles.backgroundImage}>
          <SensorSettings />
          <AccountRemindersSettings
            notificationsEnabled={this.state.notificationsEnabled}
            updateNotifications={this.updateNotifications}
          />
          <HelpSettings />
          <View style={styles.buttonContainer}>
            <Button
              primary
              text="SIGN OUT"
              style={styles._button}
              onPress={() => {
                SensitiveInfo.deleteItem(constants.accessTokenStorageKey);
                SensitiveInfo.deleteItem(constants.userStorageKey);
                this.props.navigator.popToTop();
              }}
            />
          </View>
        </Image>
        {this.props.app.config.DEV_MODE &&
          <View style={{ marginTop: 5, borderWidth: 1 }}>
            <BodyText>Dev menu:</BodyText>
            <TouchableOpacity
              onPress={() => SensitiveInfo.deleteItem(constants.accessTokenStorageKey)}
            >
              <SecondaryText>Delete access token from storage</SecondaryText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => SensitiveInfo.deleteItem(constants.userStorageKey)}
            >
              <SecondaryText>Delete user from storage</SecondaryText>
            </TouchableOpacity>
          </View>
        }
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { app } = state;
  return { app };
};

SettingsIcon.propTypes = {
  iconName: PropTypes.string,
};

SettingsText.propTypes = {
  text: PropTypes.string,
};

AccountRemindersSettings.propTypes = {
  updateNotifications: PropTypes.func,
  notificationsEnabled: PropTypes.bool,
};

export default connect(mapStateToProps)(Settings);
