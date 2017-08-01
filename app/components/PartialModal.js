import React, { PropTypes } from 'react';
import { Modal, View } from 'react-native';
import { connect } from 'react-redux';
// import { isFunction } from 'lodash';
import appActions from '../actions/app';
import Button from '../components/Button';
import styles from '../styles/partialModal';

const getButtons = (props) => {
  const buttonConfigs = props.buttonConfigs;
  const buttons = [];
  for (let i = 0; i < buttonConfigs.length; i++) {
    const param = buttonConfigs[i];
    buttons.push(
      <Button
        style={styles._button}
        text={param.caption}
        key={i}
        onPress={() => props.dispatch(appActions.hidePartialModal())}
        primary={i === buttonConfigs.length - 1}
      />
    );
  }
  return buttons;
};

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
        {props.children}
        {
          props.buttonConfigs && props.buttonConfigs.length > 0 &&
          <View style={styles.buttonContainer}>
            {getButtons(props)}
          </View>
        }
      </View>
    </View>
  </Modal>
) || null);

PartialModal.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  buttonConfigs: PropTypes.array,
  show: PropTypes.bool,
};

export default connect()(PartialModal);
