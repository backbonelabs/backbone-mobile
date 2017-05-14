import React, { PropTypes } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { isFunction } from 'lodash';
import appActions from '../actions/app';
import styles from '../styles/partialModal';

const PartialModal = props => ((props.show &&
  <Modal
    animationType="none"
    transparent
    visible
    onRequestClose={() => {
      // This is called on Android when the hardware back button is pressed
      // For now, this will be a no-op
    }}
  >
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.buttonContainer}>
          {
            !props.hideClose &&
            <TouchableOpacity
              onPress={() => {
                props.dispatch(appActions.hidePartialModal());
                if (isFunction(props.onClose)) {
                  props.onClose();
                }
              }}
            >
              <Icon
                name="close"
                size={styles.$iconSize}
                color={styles._closeIcon.color}
              />
            </TouchableOpacity>
          }
        </View>
        {props.children}
      </View>
    </View>
  </Modal>
) || null);

PartialModal.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  hideClose: PropTypes.bool,
  show: PropTypes.bool,
};

export default connect()(PartialModal);
