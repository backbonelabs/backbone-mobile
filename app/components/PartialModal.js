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
    showPartial: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    autobind(this);
  }

  getButtons() {
    const buttonConfigs = this.props.config.buttons;
    return buttonConfigs.map((val, index) => (
      <Button
        style={styles._button}
        text={val.caption}
        key={index}
        onPress={val.onPress ? val.onPress : this.defaultHandler}
        primary={index === buttonConfigs.length - 1}
      />
    ));
  }

  defaultHandler() {
    this.props.dispatch(appActions.hidePartialModal());
  }

  render() {
    if (!this.props.showPartial) {
      return null;
    }
    return (
      <Modal
        animationType="none"
        transparent
        visible
        onRequestClose={this.props.config.backButtonHandler ? this.props.config.backButtonHandler :
          () => {
            // Empty default handler
          }
        }
      >
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            { this.props.config.topView &&
              <View style={styles.topView}>
                {this.props.config.topView}
              </View>
            }
            { this.props.config.title &&
              <HeadingText
                size={1}
                style={[
                  styles._titleText,
                  this.props.config.title.color && { color: this.props.config.title.color },
                ]}
              >
                {this.props.config.title.caption}
              </HeadingText>
            }
            <BodyText style={styles._detailText}>
              {this.props.config.detail.caption}
            </BodyText>
            { this.props.config.buttons && this.props.config.buttons.length > 0 &&
              <View style={styles.buttonContainer}>
                {this.getButtons()}
              </View>
            }
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  const { app: { modal } } = state;
  return { ...modal };
};

export default connect(mapStateToProps)(PartialModal);
