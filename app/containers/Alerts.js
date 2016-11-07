import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Switch,
  ScrollView,
  Slider,
} from 'react-native';
import { cloneDeep } from 'lodash';
import { connect } from 'react-redux';
import userAction from '../actions/user';
import styles from '../styles/alerts';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import thumbImage from '../images/settings/thumbImage.png';
import trackImage from '../images/settings/trackImage.png';
import gradientBackground20 from '../images/gradientBackground20.png';

const BackboneVibration = props => (
  <View style={styles.vibrationContainer}>
    <View style={styles.vibrationText}>
      <BodyText>Backbone Vibration</BodyText>
    </View>
    <View style={styles.vibrationSwitch}>
      <Switch
        value={props.user.settings.backboneVibration}
        onValueChange={value => props.updateUserSettings('backboneVibration', value)}
      />
    </View>
  </View>
);

const VibrationSettings = props => (
  <View style={styles.vibrationSettingsContainer}>
    <View style={styles.sliderContainer}>
      <View style={styles.sliderText}>
        <BodyText>Vibration Strength</BodyText>
      </View>
      <View style={styles.slider}>
        <Slider
          // TO DO: Update when values for vibrationStrength are finalized
          minimumValue={0.1}
          maximumValue={1}
          step={0.1}
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

const PhoneVibration = props => (
  <View style={styles.vibrationContainer}>
    <View style={styles.vibrationText}>
      <BodyText>Phone Vibration</BodyText>
    </View>
    <View style={styles.vibrationSwitch}>
      <Switch
        value={props.user.settings.phoneVibration}
        onValueChange={value => props.updateUserSettings('phoneVibration', value)}
      />
    </View>
  </View>
);

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
      isUpdating: PropTypes.bool,
    }),
  };

  constructor() {
    super();

    // Attempted to use state to make switch transition smoother
    // Still a possibility, will discuss with Kevin
    this.state = {};
    this.updateUserSettings = this.updateUserSettings.bind(this);
  }

  // Update user setting
  updateUserSettings(field, value) {
    const { user } = this.props.user;
    const clonedSettings = cloneDeep(user.settings);
    const userSettingsUpdateFields = {
      settings: Object.assign({}, clonedSettings, { [field]: value }),
    };
    const updatedUser = { _id: user._id, userSettingsUpdateFields };

    this.props.dispatch(userAction.updateUserSettings(updatedUser));
  }

  render() {
    const { user } = this.props.user;

    return (
      <ScrollView>
        <Image source={gradientBackground20} style={styles.backgroundImage}>
          <View style={styles.spacerContainer} />
          <BackboneVibration user={user} updateUserSettings={this.updateUserSettings} />
          <VibrationSettings user={user} updateUserSettings={this.updateUserSettings} />
          <PhoneVibration user={user} updateUserSettings={this.updateUserSettings} />
          <View style={styles.batteryLifeWarningContainer}>
            <SecondaryText style={styles._batteryLifeWarningText}>
              Increasing the vibration strength and pattern of
              your Backbone will decrease the battery life
            </SecondaryText>
          </View>
        </Image>
      </ScrollView>
    );
  }
}

BackboneVibration.propTypes = {
  user: PropTypes.shape({
    settings: PropTypes.shape({
      backboneVibration: PropTypes.bool,
    }),
  }),
  updateUserSettings: PropTypes.func,
};

VibrationSettings.propTypes = {
  user: PropTypes.shape({
    settings: PropTypes.shape({
      vibrationStrength: PropTypes.number,
      vibrationPattern: PropTypes.number,
    }),
  }),
  updateUserSettings: PropTypes.func,
};

PhoneVibration.propTypes = {
  user: PropTypes.shape({
    settings: PropTypes.shape({
      phoneVibration: PropTypes.bool,
    }),
  }),
  updateUserSettings: PropTypes.func,
};

const mapStateToProps = (state) => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(Alerts);
