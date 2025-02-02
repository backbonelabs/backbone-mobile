import React, { Component, PropTypes } from 'react';
import {
  Image,
  ScrollView,
  TextInput,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import appActions from '../actions/app';
import supportActions from '../actions/support';
import HeadingText from '../components/HeadingText';
import sendout from '../images/settings/sendout.png';
import styles from '../styles/support';
import theme from '../styles/theme';

const ConfirmationMessage = props => (
  <View style={styles.confirmationMessageContainer}>
    <Image source={sendout} style={styles.confirmationMessageImage} />
    <HeadingText size={3} style={styles.confirmationMessageText}>
      {props.nickname}, help is on the way!
    </HeadingText>
    <HeadingText size={3} style={[{ marginTop: 16 }, styles.confirmationMessageText]}>
      We'll be in touch
    </HeadingText>
  </View>
);

ConfirmationMessage.propTypes = {
  nickname: PropTypes.string,
};

class Support extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      pop: PropTypes.func,
    }),
    support: PropTypes.shape({
      inProgress: PropTypes.bool,
      errorMessage: PropTypes.string,
    }),
    user: PropTypes.shape({
      nickname: PropTypes.string,
    }),
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.support.inProgress && !nextProps.support.inProgress) {
      if (nextProps.support.errorMessage) {
        this.props.dispatch(appActions.showPartialModal({
          title: {
            caption: 'Error',
            color: theme.warningColor,
          },
          detail: {
            caption: nextProps.support.errorMessage,
          },
          buttons: [
            {
              caption: 'OK',
              onPress: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      } else {
        this.props.dispatch(appActions.showFullModal({
          onClose: this.props.navigator.pop,
          content: <ConfirmationMessage nickname={this.props.user.nickname} />,
        }));
      }
    }
  }

  render() {
    const mainContent = (
      <View style={styles.container}>
        <TextInput
          style={styles.inputField}
          placeholder="Message here"
          multiline
          autoFocus
          onChangeText={text => this.props.dispatch(supportActions.updateMessage(text))}
        />
      </View>
    );

    return (
      <ScrollView>
        { Platform.OS === 'ios' ?
          <KeyboardAvoidingView behavior="padding">
            { mainContent }
          </KeyboardAvoidingView>
          :
          mainContent
        }
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { support, user: { user } } = state;
  return { support, user };
};

export default connect(mapStateToProps)(Support);
