import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  Slider,
  Switch,
  ScrollView,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import { get, isEmpty, isEqual } from 'lodash';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import userActions from '../actions/user';
import deviceActions from '../actions/device';
import styles from '../styles/settings';

const { PropTypes } = React;

class Settings extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      replace: PropTypes.func,
    }),
    dispatch: PropTypes.func,
    errorMessage: PropTypes.string,
    isFetching: PropTypes.bool,
    isUpdating: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
      settings: PropTypes.object,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      isPristine: true,
      settings: get(this.props.user, 'settings', {}),
    };
    this.update = this.update.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
  }

  componentWillMount() {
    // Fetch latest user settings
    this.props.dispatch(userActions.fetchUserSettings());
  }

  componentWillReceiveProps(nextProps) {
    let stateChanges = {};

    if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
    } else if (!isEqual(this.props.user, nextProps.user)) {
      stateChanges = {
        ...stateChanges,
        settings: nextProps.user.settings,
      };
    }

    // Reset pristine flag after updating settings
    if (this.props.isUpdating && !nextProps.isUpdating && !nextProps.errorMessage) {
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
      _id: this.props.user._id,
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
        {this.props.isFetching || this.props.isUpdating ?
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
              onPress={() => {
                this.props.dispatch(deviceActions.forget());
              }}
            >
              <Text>Forget this device</Text>
            </TouchableHighlight>
          </ScrollView>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Settings);
