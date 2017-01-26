import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Switch,
  Slider,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import userAction from '../actions/user';
import styles from '../styles/alerts';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import thumbImage from '../images/settings/thumbImage.png';
import trackImage from '../images/settings/trackImage.png';

const AlertToggle = props => (
  <View style={styles.vibrationContainer}>
    <View style={styles.vibrationText}>
      <BodyText>{props.text}</BodyText>
    </View>
    <View style={styles.vibrationSwitch}>
      <Switch
        value={props.value}
        onValueChange={value => props.onChange(props.settingName, value)}
      />
    </View>
  </View>
);

AlertToggle.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func,
  text: PropTypes.string.isRequired,
  settingName: PropTypes.string.isRequired,
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
          vibrationStrength: PropTypes.number,
          vibrationPattern: PropTypes.number,
        }),
      }),
      errorMessage: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    const {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
    } = this.props.user.user.settings;

    // Maintain settings in component state because the user settings object
    // will change back and forth during the asynchronous action for updating
    // the user settings in the backend, and that will cause a flicker/lag in
    // the UI when modifying each setting
    this.state = {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
    };

    // Debounce update of user settings setting to limit the number of API requests
    this.updateUserSettings = debounce(this.updateUserSettings, 1000);
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

  @autobind
  updateSetting(field, value) {
    this.setState({ [field]: value });
    const { settings, _id } = this.props.user.user;
    this.updateUserSettings({
      _id,
      settings: Object.assign({}, settings, { [field]: value }),
    });
  }

  /**
   * Update user settings in the backend
   * @param {Object} updatedUserSettings New user settings
   */
  @autobind
  updateUserSettings(updatedUserSettings) {
    // Update app store and user account to reflect new settings
    this.props.dispatch(userAction.updateUserSettings(updatedUserSettings));
  }

  render() {
    const {
      backboneVibration,
      vibrationStrength,
      vibrationPattern,
      phoneVibration,
    } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.spacerContainer} />
        <AlertToggle
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
                thumbImage={thumbImage}
                trackImage={trackImage}
                value={vibrationStrength}
                onValueChange={value => this.updateSetting('vibrationStrength', value)}
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
                value={vibrationPattern}
                onValueChange={value => this.updateSetting('vibrationPattern', value)}
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
        <AlertToggle
          value={phoneVibration}
          onChange={this.updateSetting}
          text="Phone Vibration"
          settingName="phoneVibration"
        />
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
