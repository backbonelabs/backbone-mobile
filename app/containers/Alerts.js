import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Image,
  Switch,
  Slider,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import userAction from '../actions/user';
import styles from '../styles/alerts';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import thumbImage from '../images/settings/thumbImage.png';
import trackImage from '../images/settings/trackImage.png';
import gradientBackground20 from '../images/gradientBackground20.png';

const VibrationToggle = props => (
  <View style={styles.vibrationContainer}>
    <View style={styles.vibrationText}>
      <BodyText>{props.text}</BodyText>
    </View>
    <View style={styles.vibrationSwitch}>
      <Switch
        value={props.user.settings[props.settingName]}
        onValueChange={value => props.updateUserSettings(props.settingName, value)}
      />
    </View>
  </View>
);

VibrationToggle.propTypes = {
  user: PropTypes.shape({
    settings: PropTypes.shape({
      phoneVibration: PropTypes.bool,
    }),
  }),
  updateUserSettings: PropTypes.func,
  text: PropTypes.string.isRequired,
  settingName: PropTypes.string.isRequired,
};

const VibrationSettings = props => (
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
          thumbImage={thumbImage}
          trackImage={trackImage}
          value={props.user.settings.vibrationStrength}
          onValueChange={value => props.updateUserSettings('vibrationStrength', value)}
        />
      </View>
      <View style={styles.sliderDetails}>
        <View style={{ flex: 0.5 }}>
          <SecondaryText style={styles._sliderDetailsText}>Low</SecondaryText>
        </View>
        <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
          <SecondaryText style={styles._sliderDetailsText}>High</SecondaryText>
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
          thumbImage={thumbImage}
          trackImage={trackImage}
          value={props.user.settings.vibrationPattern}
          onValueChange={value => props.updateUserSettings('vibrationPattern', value)}
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
);

VibrationSettings.propTypes = {
  user: PropTypes.shape({
    settings: PropTypes.shape({
      vibrationStrength: PropTypes.number,
      vibrationPattern: PropTypes.number,
    }),
  }),
  updateUserSettings: PropTypes.func,
};

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
          phoneVibration: PropTypes.bool,
          vibrationPattern: PropTypes.number,
        }),
      }),
      errorMessage: PropTypes.string,
    }),
  };

  componentWillReceiveProps(nextProps) {
    // Check if errorMessage is present in nextProps
    if (!this.props.user.errorMessage && nextProps.user.errorMessage) {
      // Check if API error prevented settings update
      if (this.props.user.user.settings === nextProps.user.user.settings) {
        Alert.alert('Error', 'Your settings were NOT saved, please try again.');
      }
    }
  }

  // Update user settings
  @autobind
  updateUserSettings(field, value) {
    const { settings, _id } = this.props.user.user;
    const updatedUserSettings = {
      _id,
      settings: Object.assign({}, settings, { [field]: value }),
    };

    // Update app store and user account to reflect new settings
    this.props.dispatch(userAction.updateUserSettings(updatedUserSettings));
  }

  render() {
    const { user } = this.props.user;

    return (
      <Image source={gradientBackground20} style={styles.backgroundImage}>
        <View style={styles.spacerContainer} />
        <VibrationToggle
          user={user}
          updateUserSettings={this.updateUserSettings}
          text="Backbone Vibration"
          settingName="backboneVibration"
        />
        <VibrationSettings user={user} updateUserSettings={this.updateUserSettings} />
        <VibrationToggle
          user={user}
          updateUserSettings={this.updateUserSettings}
          text="Phone Vibration"
          settingName="phoneVibration"
        />
        <View style={styles.batteryLifeWarningContainer}>
          <SecondaryText style={styles._batteryLifeWarningText}>
            Increasing the vibration strength and pattern of
            your Backbone will decrease its battery life
          </SecondaryText>
        </View>
      </Image>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(Alerts);
