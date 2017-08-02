import React, { PropTypes } from 'react';
import { Modal, View } from 'react-native';
import { connect } from 'react-redux';
import appActions from '../actions/app';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import styles from '../styles/partialModal';

const getButtons = (props) => {
  const defaultHandler = () => {
    props.dispatch(appActions.hidePartialModal());
  };
  const buttonConfigs = props.config.buttons;
  const buttons = [];
  for (let i = 0; i < buttonConfigs.length; i++) {
    const param = buttonConfigs[i];
    buttons.push(
      <Button
        style={styles._button}
        text={param.caption}
        key={i}
        onPress={param.onPress ? param.onPress : defaultHandler}
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
      // This is called on Android when the hardware back button is pressed.
      // Dismiss the popup when allowed.
      if (props.config.allowBackButton) {
        props.dispatch(appActions.hidePartialModal());
      }
    }}
  >
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        { props.config.topView &&
          <View style={styles.topView}>
            {props.config.topView}
          </View>
        }
        { props.config.title &&
          <BodyText
            style={[
              styles._titleText,
              props.config.title.color && { color: props.config.title.color },
            ]}
          >
            {props.config.title.caption}
          </BodyText>
        }
        <SecondaryText style={styles._detailText}>
          {props.config.detail.caption}
        </SecondaryText>
        { props.config.buttons && props.config.buttons.length > 0 &&
          <View style={styles.buttonContainer}>
            {getButtons(props)}
          </View>
        }
      </View>
    </View>
  </Modal>
) || null);

PartialModal.propTypes = {
  dispatch: PropTypes.func,
  config: PropTypes.shape({
    topView: PropTypes.node,
    title: PropTypes.shape({
      caption: PropTypes.string,
      color: PropTypes.string,
    }),
    detail: PropTypes.shape({
      caption: PropTypes.string,
      color: PropTypes.string,
    }),
    buttons: PropTypes.array,
    allowBackButton: PropTypes.bool, // Only used in Android
  }),
  show: PropTypes.bool,
};

export default connect()(PartialModal);
