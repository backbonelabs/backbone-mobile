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
  InteractionManager,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import SvgUri from 'react-native-svg-uri';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
import styles from '../styles/settings';
import theme from '../styles/theme';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';
import Spinner from '../components/Spinner';

const { storageKeys } = constants;

const ArrowIcon = () => (
  <View style={styles.settingsRightIcon}>
    <SvgUri source={arrow} width={styles.$arrowWidth} height={styles.$arrowHeight} />
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
    {Platform.select({
      ios: (
        <View style={styles.settingsRow}>
          <SettingsIcon iconName="tap-and-play" />
          <SettingsText text="Push Notifications" />
          <View style={styles.settingsRightIcon}>
            <Switch
              onValueChange={props.updateNotifications}
              value={props.notificationsEnabled}
            />
          </View>
        </View>
      ),
      android: (
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => NativeModules.UserSettingService.launchAppSettings()}
        >
          <SettingsIcon iconName="tap-and-play" />
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
  <View>
    <View style={styles.settingsHeader}>
      <BodyText>HELP</BodyText>
    </View>
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={() => props.navigator.push(routes.howTo)}
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
      loading: true,
    };
  }

  componentDidMount() {
    // Run expensive operations after the scene is loaded
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(deviceActions.getInfo());
      if (Platform.OS === 'ios') {
        // Check if user has enabled notifications on their iOS device
        this.checkNotificationsPermission();

        AppState.addEventListener('change', state => {
          if (state === 'active') {
            this.checkNotificationsPermission();
          }
        });
      }
      this.setState({ loading: false });
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

    if (this.state.loading) {
      return <Spinner />;
    }

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
