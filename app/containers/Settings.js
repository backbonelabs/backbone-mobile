import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  Slider,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { get, isEmpty, isEqual, pick } from 'lodash';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import userActions from '../actions/user';
import styles from '../styles/profile';

const { PropTypes } = React;

class Settings extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    errorMessage: PropTypes.string,
    isFetching: PropTypes.bool,
    isUpdating: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
      postureThreshold: PropTypes.string,
    }),
  };

  static defaultProps = {
    user: PropTypes.shape({
      _id: undefined,
      postureThreshold: 20,
    }),
  };

  constructor(props) {
    super(props);
    console.log('props ', props);
    this.state = {
      isPristine: true,
      postureThreshold: get(this.props.user, 'postureThreshold'),
    };
    this.isValid = this.isValid.bind(this);
    this.update = this.update.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
  }

  componentWillMount() {
    // Fetch latest user profile info
    this.props.dispatch(userActions.fetchUser());
  }

  componentWillReceiveProps(nextProps) {
    let stateChanges = {};

    if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
    } else if (!isEqual(this.props.user, nextProps.user)) {
      stateChanges = {
        ...stateChanges,
        postureThreshold: nextProps.user.postureThreshold,
      };
    }

    // Reset pristine flag after updating profile
    if (this.props.isUpdating && !nextProps.isUpdating && !nextProps.errorMessage) {
      stateChanges = {
        ...stateChanges,
        isPristine: true,
      };
    }

    if (!isEmpty(stateChanges)) {
      console.log('state changes ', stateChanges);
      this.setState(stateChanges);
    }
  }

  isValid() {
    const {
      postureThreshold,
    } = this.state;

    return !isEmpty(postureThreshold);
  }

  update() {
    const updatedFields = pick(this.state, ['postureThreshold']);

    this.props.dispatch(userActions.updateUserConfig({
      _id: this.props.user._id,
      ...updatedFields,
    }));
  }

  /**
   * Updates a field and sets the pristine flag to false
   * @param {String} field
   * @param {String} value
   */
  updateConfig(field, value) {
    this.setState({
      isPristine: false,
      [field]: value,
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
              <Text>Posture Threshold ({this.state.postureThreshold})</Text>
              <Slider
                style={styles.slider}
                value={this.state.postureThreshold}
              />
            </View>
            <Button
              disabled={this.state.isPristine || !this.isValid()}
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
