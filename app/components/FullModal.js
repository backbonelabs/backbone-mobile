import React, { PropTypes } from 'react';
import { Image, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import appActions from '../actions/app';
import gradientBackground20 from '../images/gradientBackground20.png';
import styles from '../styles/fullModal';

const FullModal = props => (
  <Image source={gradientBackground20} style={styles.container}>
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() => {
          props.dispatch(appActions.hideFullModal());
          props.onClose();
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
  </Image>
);

FullModal.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
};

export default connect()(FullModal);
