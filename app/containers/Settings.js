import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  Slider,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { get, isEmpty, isEqual } from 'lodash';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import userActions from '../actions/user';
import styles from '../styles/settings';

const { PropTypes } = React;

class Settings extends Component {
  static propTypes = {
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
              <Text>Posture Threshold</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={1}
                step={0.01}
                value={this.state.settings.postureThreshold}
                onSlidingComplete={value => this.updateSettings('postureThreshold', value)}
              />
            </View>
            <Button
              disabled={this.state.isPristine}
              onPress={this.update}
              text="Save"
            />
          </ScrollView>
        }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Settings);
