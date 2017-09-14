import React, { Component, PropTypes } from 'react';
import autobind from 'class-autobind';
import { Modal, View } from 'react-native';
import { connect } from 'react-redux';
import appActions from '../actions/app';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import styles from '../styles/partialModal';

class PartialModal extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    config: PropTypes.shape({
      overlay: PropTypes.node,
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
      customStyles: PropTypes.shape({
        containerStyle: View.propTypes.style,
        topViewStyle: View.propTypes.style,
        detailTextStyle: BodyText.propTypes.style,
      }),
    }),
    showPartial: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    autobind(this);
  }

  getButtons() {
    const buttonConfigs = this.props.config.buttons;

    return buttonConfigs.map((val, index) => {
      const colorStyle = (val.color ? { backgroundColor: val.color } : {});

      return (
        <Button
          shadow={index !== 0}
          style={[styles.button, colorStyle]}
          text={val.caption}
          key={index}
          underlayColor={val.underlayColor}
          onPress={val.onPress ? val.onPress : this.defaultHandler}
          primary={index === buttonConfigs.length - 1}
        />
      );
    });
  }

  defaultHandler() {
    this.props.dispatch(appActions.hidePartialModal());
  }

  render() {
    if (!this.props.showPartial) {
      return null;
    }

    const { config } = this.props;
    const {
      overlay,
      topView,
      title,
      detail,
      buttons,
      customStyles = {},
    } = config;

    return (
      <Modal
        animationType="none"
        transparent
        visible
        onRequestClose={config.backButtonHandler ? config.backButtonHandler :
          () => {
            // Empty default handler
          }
        }
      >
        <View style={styles.outerContainer}>
          <View style={[styles.innerContainer, customStyles.containerStyle]}>
            { topView &&
              <View style={[styles.topView, customStyles.topViewStyle]}>
                {topView}
              </View>
            }
            { title &&
              <HeadingText
                size={1}
                style={[
                  styles.titleText,
                  title.color && { color: title.color },
                ]}
              >
                {title.caption}
              </HeadingText>
            }
            { detail &&
              <BodyText style={[styles.detailText, customStyles.detailTextStyle]}>
                {detail.caption}
              </BodyText>
            }
            { buttons && buttons.length > 0 &&
              <View style={styles.buttonContainer}>
                {this.getButtons()}
              </View>
            }
          </View>
        </View>
        {overlay}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  const { app: { modal } } = state;
  return { ...modal };
};

export default connect(mapStateToProps)(PartialModal);
