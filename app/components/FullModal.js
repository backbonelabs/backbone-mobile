import React, { PropTypes } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { isFunction } from 'lodash';
import appActions from '../actions/app';
import styles from '../styles/fullModal';

const FullModal = props => (
  props.showFull ? (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            props.dispatch(appActions.hideFullModal());
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
  ) : null
);

FullModal.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  showFull: PropTypes.bool,
};

export default connect()(FullModal);
