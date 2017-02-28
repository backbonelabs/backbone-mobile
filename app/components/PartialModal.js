import React, { PropTypes } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { isFunction } from 'lodash';
import appActions from '../actions/app';
import styles from '../styles/partialModal';

const PartialModal = props => (
  <Modal
    animationType="none"
    transparent
    visible={props.showPartial}
  >
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.buttonContainer}>
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
        </View>
        {props.children}
      </View>
    </View>
  </Modal>
);

PartialModal.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  showPartial: PropTypes.bool,
};

export default connect()(PartialModal);
