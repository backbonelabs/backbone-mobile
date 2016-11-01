import React, { Component, PropTypes } from 'react';
import {
  View,
  Text,
  Alert,
  Slider,
  Switch,
  ScrollView,
  NativeModules,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import { get, isEmpty, isEqual } from 'lodash';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import userActions from '../actions/user';
import styles from '../styles/settings';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';

const { DeviceManagementService } = NativeModules;

class Settings extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      popToTop: PropTypes.func,
    }),
    dispatch: PropTypes.func,
    app: PropTypes.shape({
      config: PropTypes.object,
    }),
    user: PropTypes.shape({
      errorMessage: PropTypes.string,
      isFetching: PropTypes.bool,
      isUpdating: PropTypes.bool,
      user: PropTypes.shape({
        _id: PropTypes.string,
        settings: PropTypes.object,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      isPristine: true,
      settings: get(this.props.user.user, 'settings', {}),
    };
    this.update = this.update.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let stateChanges = {};

    if (!this.props.user.errorMessage && nextProps.user.errorMessage) {
      Alert.alert('Error', nextProps.user.errorMessage);
    } else if (!isEqual(this.props.user.user, nextProps.user.user)) {
      stateChanges = {
        ...stateChanges,
        settings: nextProps.user.user.settings,
      };
    }

    // Reset pristine flag after updating settings
    if (this.props.user.isUpdating && !nextProps.user.isUpdating && !nextProps.user.errorMessage) {
      stateChanges = {
        ...stateChanges,
        isPristine: true,
      };
    }

    if (!isEmpty(stateChanges)) {
      this.setState(stateChanges);
    }
  }

  update() {
    this.props.dispatch(userActions.updateUserSettings({
      _id: this.props.user.user._id,
      settings: this.state.settings,
    }));
  }

  /**
   * Updates a field and sets the pristine flag to false
   * @param {String} field
   * @param {String} value
   */
  updateSettings(field, value) {
    this.setState({
      isPristine: false,
      settings: Object.assign({}, this.state.settings, { [field]: value }),
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.user.isFetching || this.props.user.isUpdating ?
          <Spinner />
          :
            <ScrollView style={styles.innerContainer}>
              <View style={styles.postureThreshold}>
                <Text style={styles.text}>Posture Threshold</Text>
                <Slider
                  minimumValue={0.1}
                  maximumValue={1}
                  step={0.01}
                  value={this.state.settings.postureThreshold}
                  onSlidingComplete={value => this.updateSettings('postureThreshold', value)}
                />
              </View>
              <View style={styles.vibrationContainer}>
                <View style={styles.vibration}>
                  <Text>Backbone Vibration</Text>
                  <Switch
                    value={this.state.settings.backboneVibration}
                    onValueChange={value => this.updateSettings('backboneVibration', value)}
                  />
                </View>
                <View style={styles.vibration}>
                  <Text>Phone Vibration</Text>
                  <Switch
                    value={this.state.settings.phoneVibration}
                    onValueChange={value => this.updateSettings('phoneVibration', value)}
                  />
                </View>
              </View>
              <View style={styles.postureThreshold}>
                <Text style={styles.text}>Slouch Time Threshold</Text>
                <Slider
                  minimumValue={5}
                  maximumValue={60}
                  step={1}
                  value={this.state.settings.slouchTimeThreshold}
                  onSlidingComplete={value => this.updateSettings('slouchTimeThreshold', value)}
                />
              </View>
              <Button
                disabled={this.state.isPristine}
                onPress={this.update}
                text="Save"
              />
              <TouchableHighlight
                style={styles.forget}
                onPress={() => (
                  DeviceManagementService.forgetDevice((error) => {
                    if (error) {
                      // Placeholder until Rocio finalizes flow
                    } else {
                      this.props.navigator.popToTop();
                    }
                  })
                )}
              >
                <Text>Forget this device</Text>
              </TouchableHighlight>
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
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { app, user } = state;
  return { app, user };
};

export default connect(mapStateToProps)(Settings);
