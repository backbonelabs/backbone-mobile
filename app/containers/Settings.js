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
} from 'react-native';
import { connect } from 'react-redux';
import SvgUri from 'react-native-svg-uri';
import SensitiveInfo from '../utils/SensitiveInfo';
import routes from '../routes';
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
import authActions from '../actions/auth';

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
      onPress={() => props.navigator.push(routes.alerts)}
    >
      <SettingsIcon iconName="alert" />
      <SettingsText text="Alerts" />
      <ArrowIcon />
    </TouchableOpacity>
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
    <View style={styles.helpSettingContainer}>
      <SettingsIcon iconName="tutorial" />
      <SettingsText text="How To Use" />
      <ArrowIcon />
    </View>
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
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
    }),
    app: PropTypes.shape({
      config: PropTypes.object,
    }),
    dispatch: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      notificationsEnabled: false,
    };

    this.updateNotifications = this.updateNotifications.bind(this);
    this.signOut = this.signOut.bind(this);
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
            this.props.navigator.resetTo(routes.welcome);
          },
        },
      ]
    );
  }

  render() {
    return (
      <ScrollView>
        <Image source={gradientBackground20} style={styles.backgroundImage}>
          <SensorSettings />
          <AccountRemindersSettings
            navigator={this.props.navigator}
            notificationsEnabled={this.state.notificationsEnabled}
            updateNotifications={this.updateNotifications}
          />
          <HelpSettings navigator={this.props.navigator} />
          <View style={styles.buttonContainer}>
            <Button
              primary
              text="SIGN OUT"
              onPress={this.signOut}
            />
          </View>
        </Image>
        {this.props.app.config.DEV_MODE &&
          <View style={{ marginTop: 5, borderWidth: 1 }}>
            <BodyText>Dev menu:</BodyText>
            <TouchableOpacity
              onPress={() => SensitiveInfo.deleteItem(storageKeys.ACCESS_TOKEN)}
            >
              <SecondaryText>Delete access token from storage</SecondaryText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => SensitiveInfo.deleteItem(storageKeys.USER)}
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

export default connect(mapStateToProps)(Settings);
