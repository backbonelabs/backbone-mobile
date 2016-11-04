import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Switch,
  Linking,
  Platform,
  AppState,
  PushNotificationIOS,
} from 'react-native';
import SvgUri from 'react-native-svg-uri';
import SensitiveInfo from '../utils/SensitiveInfo';
import constants from '../utils/constants';
import styles from '../styles/settings';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import backgroundOpacity from '../images/backgroundOpacity.png';
import arrow from '../images/settings/arrow.svg';
import batteryIcon from '../images/settings/batteryIcon.png';
import sensorSmall from '../images/settings/sensorSmall.png';
import profileIcon from '../images/settings/profileIcon.svg';
import alertIcon from '../images/settings/alertIcon.svg';
import tutorialIcon from '../images/settings/tutorialIcon.svg';
import supportIcon from '../images/settings/supportIcon.svg';
import notificationsIcon from '../images/settings/notificationsIcon.svg';
import SecondaryText from '../components/SecondaryText';

const SensorSettings = () => (
  <View style={styles.sensorSettingsContainer}>
    <View style={styles.sensorIcon}>
      <Image source={sensorSmall} />
    </View>
    <View style={styles.sensorText}>
      <BodyText>MY BACKBONE</BodyText>
      <View style={styles.batteryInfo}>
        <Image source={batteryIcon} style={styles.batteryIcon} />
        <SecondaryText style={styles._batteryText}>Battery: 100%</SecondaryText>
      </View>
      <SecondaryText style={styles._batteryText}>About 10 days</SecondaryText>
    </View>
    <View style={styles.arrow}>
      <SvgUri source={arrow} />
    </View>
  </View>
);

const AccountRemindersSettings = props => (
  <View style={styles.accountRemindersContainer}>
    <View style={styles.accountRemindersHeader}>
      <BodyText>ACCOUNT & REMINDERS</BodyText>
    </View>
    <View style={styles.accountRemindersSettingContainer}>
      <View style={styles.settingsIcon}>
        <SvgUri source={profileIcon} />
      </View>
      <View style={styles.settingsText}>
        <BodyText>Profile</BodyText>
      </View>
      <View style={styles.arrow}>
        <SvgUri source={arrow} />
      </View>
    </View>
    <View style={styles.accountRemindersSettingContainer}>
      <View style={styles.settingsIcon}>
        <SvgUri source={alertIcon} />
      </View>
      <View style={styles.settingsText}>
        <BodyText>Alerts</BodyText>
      </View>
      <View style={styles.arrow}>
        <SvgUri source={arrow} />
      </View>
    </View>
    <View style={styles.notificationsContainer}>
      <View style={styles.settingsIcon}>
        <SvgUri source={notificationsIcon} />
      </View>
      <View style={styles.notificationsText}>
        <BodyText>Push Notifications</BodyText>
      </View>
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
      <View style={styles.settingsIcon}>
        <SvgUri source={tutorialIcon} />
      </View>
      <View style={styles.settingsText}>
        <BodyText>How To Use</BodyText>
      </View>
      <View style={styles.arrow}>
        <SvgUri source={arrow} />
      </View>
    </View>
    <View style={styles.helpSettingContainer}>
      <View style={styles.settingsIcon}>
        <SvgUri source={supportIcon} />
      </View>
      <View style={styles.settingsText}>
        <BodyText>Support</BodyText>
      </View>
      <View style={styles.arrow}>
        <SvgUri source={arrow} />
      </View>
    </View>
  </View>
);

class Settings extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      popToTop: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      isPristine: true,
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
      if (permissions.alert !== this.state.notificationsEnabled) {
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
      <View style={styles.container}>
        <View style={{ height: 55 }} />
        <Image source={backgroundOpacity} style={styles.backgroundImage}>
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
          <View style={{ flex: 0.17 }} />
        </Image>
      </View>
    );
  }
}

AccountRemindersSettings.propTypes = {
  updateNotifications: PropTypes.func,
  notificationsEnabled: PropTypes.bool,
};

export default Settings;
