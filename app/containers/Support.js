import React, { Component, PropTypes } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import appActions from '../actions/app';
import supportActions from '../actions/support';
import HeadingText from '../components/HeadingText';
import gradientBackground20 from '../images/gradientBackground20.png';
import styles from '../styles/support';

const ConfirmationMessage = props => (
  <View style={styles.confirmationMessageContainer}>
    <HeadingText size={3} style={styles._confirmationMessageText}>{props.nickname},</HeadingText>
    <HeadingText size={3} style={styles._confirmationMessageText}>help is on the way!</HeadingText>
    <HeadingText size={3} style={[{ marginTop: 16 }, styles._confirmationMessageText]}>
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
        Alert.alert('Error', nextProps.support.errorMessage);
      } else {
        this.props.dispatch(appActions.showFullModal({
          onClose: this.props.navigator.pop,
          content: <ConfirmationMessage nickname={this.props.user.nickname} />,
        }));
      }
    }
  }

  render() {
    return (
      <ScrollView>
        <Image source={gradientBackground20}>
          <TextInput
            style={styles.inputField}
            placeholder="Message here"
            multiline
            onChangeText={text => this.props.dispatch(supportActions.updateMessage(text))}
          />
        </Image>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { support, user: { user } } = state;
  return { support, user };
};

export default connect(mapStateToProps)(Support);
