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
  return buttonConfigs.map((val, index) => (
    <Button
      style={styles._button}
      text={val.caption}
      key={index}
      onPress={val.onPress ? val.onPress : defaultHandler}
      primary={index === buttonConfigs.length - 1}
    />
  ));
};

const PartialModal = props => ((props.show &&
  <Modal
    animationType="none"
    transparent
    visible
    onRequestClose={props.config.backButtonHandler ? props.config.backButtonHandler :
      () => {
        // Empty default handler
      }
    }
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
    backButtonHandler: PropTypes.func,  // Only used in Android
  }),
  show: PropTypes.bool,
};

export default connect()(PartialModal);
