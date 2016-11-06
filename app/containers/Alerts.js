import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  Switch,
  ScrollView,
  Slider,
} from 'react-native';
import { get, cloneDeep } from 'lodash';
import { connect } from 'react-redux';
import userAction from '../actions/user';
import styles from '../styles/alerts';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import gradientBackground20 from '../images/gradientBackground20.png';

class Alerts extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      popToTop: PropTypes.func,
    }),
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

  constructor(props) {
    super(props);

    const { user } = this.props.user;

    // Use state to make Switch settings toggle look smoother
    this.state = {
      backboneVibration: get(user.settings.backboneVibration, true),
      phoneVibration: get(user.settings.phoneVibration, false),
    };
  }

  // Update state and save user setting
  updateUserSettings(field, value) {
    this.setState({ [field]: value }, () => {
      const { user } = this.props.user;
      const clonedSettings = cloneDeep(user.settings);
      const userSettingsUpdateFields = {
        settings: Object.assign({}, clonedSettings, { [field]: value }),
      };
      const updatedUser = { _id: user._id, userSettingsUpdateFields };

      this.props.dispatch(userAction.updateUserSettings(updatedUser));
    });
  }

  render() {
    const { user } = this.props.user;

    return (
      <ScrollView>
        <Image source={gradientBackground20} style={styles.backgroundImage}>
          <View style={styles.spacerContainer} />
          <View style={styles.vibrationContainer}>
            <View style={styles.vibrationText}>
              <BodyText>Backbone Vibration</BodyText>
            </View>
            <View style={styles.vibrationSwitch}>
              <Switch
                value={user.settings.backboneVibration}
                onValueChange={value => this.updateUserSettings('backboneVibration', value)}
              />
            </View>
          </View>
          <View style={styles.vibrationSettingsContainer}>
            <View style={styles.vibrationStrengthContainer}>
              <View style={styles.vibrationStrengthText}>
                <BodyText>Vibration Strength</BodyText>
              </View>
              <View style={styles.vibrationStrengthSlider}>
                <Slider
                  // TO DO: Update when values for vibrationStrength are finalized
                  minimumValue={0.1}
                  maximumValue={1}
                  step={0.01}
                  value={user.settings.vibrationStrength}
                  onValueChange={value => this.updateUserSettings('vibrationStrength', value)}
                />
              </View>
              <View style={styles.vibrationStrengthSliderText}>
                <View style={{ flex: 0.5 }}>
                  <SecondaryText style={{ color: 'black' }}>Low</SecondaryText>
                </View>
                <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
                  <SecondaryText style={{ color: 'black' }}>High</SecondaryText>
                </View>
              </View>
            </View>
            <View style={styles.vibrationPatternContainer}>
              <View style={styles.vibrationPatternText}>
                <BodyText>Vibration Pattern (Buzzes)</BodyText>
              </View>
              <View style={styles.vibrationPatternSlider}>
                <Slider
                  minimumValue={1}
                  maximumValue={3}
                  step={1}
                  value={user.settings.vibrationPattern}
                  onValueChange={value => this.updateUserSettings('vibrationPattern', value)}
                />
              </View>
              <View style={styles.vibrationPatternSliderText}>
                <View style={{ flex: 0.33 }}>
                  <SecondaryText style={{ color: 'black' }}>1</SecondaryText>
                </View>
                <View style={{ flex: 0.34, alignItems: 'center' }}>
                  <SecondaryText style={{ color: 'black' }}>2</SecondaryText>
                </View>
                <View style={{ flex: 0.33, alignItems: 'flex-end' }}>
                  <SecondaryText style={{ color: 'black' }}>3</SecondaryText>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.vibrationContainer}>
            <View style={styles.vibrationText}>
              <BodyText>Phone Vibration</BodyText>
            </View>
            <View style={styles.vibrationSwitch}>
              <Switch
                value={user.settings.phoneVibration}
                onValueChange={value => this.updateUserSettings('phoneVibration', value)}
              />
            </View>
          </View>
          <View style={styles.batteryLifeWarningContainer}>
            <SecondaryText style={styles.batteryLifeWarningText}>
              Increasing the vibration strength and pattern of
              your Backbone will decrease the battery life
            </SecondaryText>
          </View>
        </Image>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(Alerts);
