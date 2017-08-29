import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
   TouchableOpacity,
   View,
   Modal,
  } from 'react-native';
import styles from '../../styles/modalPicker.js';
import ProfilePicker from '../../containers/onBoardingFlow/profile/ProfilePicker';
import SecondaryText from '../../components/SecondaryText';

export default class CustomDatePickerIOS extends Component {
  static propTypes = {
    titleIOS: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    // The following props is use by ProfilePicker component
    height: PropTypes.object,
    weight: PropTypes.object,
    birthdate: PropTypes.object,
    pickerType: PropTypes.string,
    setPickerType: PropTypes.func,
  };

  static defaultProps = {
    cancelTextIOS: 'Cancel',
    confirmTextIOS: 'Confirm',
    titleIOS: 'Pick a date',
  };

  state = {
    userIsInteractingWithPicker: false,
    field: '',
    value: {},
    clearPickerType: false,

  };

  _handleCancel = () => {
    this.props.onCancel();
  };

  _handleConfirm = () => {
    const { field, value, clearPickerType } = this.state;
    this.props.onConfirm(field, value, clearPickerType);
  }

  _handleUpdateProfile = (field, value, clearPickerType) => {
    this.setState({ field, value, clearPickerType });
  }

  render() {
    const {
      isVisible,
      titleIOS,
    } = this.props;

    return (
      <Modal
        visible={isVisible}
        onRequestClose={this._handleOnModalHide}
        animationType={'slide'}
        transparent
      >
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.titleContainer}>
              <SecondaryText style={styles._title}>{titleIOS}</SecondaryText>
            </View>
            <View style={styles._profilePicker}>
              <ProfilePicker
                birthdate={this.props.birthdate}
                height={this.props.height}
                weight={this.props.weight}
                pickerType={this.props.pickerType}
                updateProfile={this._handleUpdateProfile}
                setPickerType={this.props.setPickerType}
              />
            </View>
            <View style={styles.confirmButton}>
              <TouchableOpacity onPress={this._handleConfirm}>
                <SecondaryText style={styles._confirmText}>CONFIRM</SecondaryText>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cancelButton}>
            <TouchableOpacity onPress={this._handleCancel}>
              <SecondaryText style={styles._cancelText}>CANCEL</SecondaryText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}
