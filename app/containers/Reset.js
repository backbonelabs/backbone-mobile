import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  StatusBar,
  Platform,
  LayoutAnimation,
} from 'react-native';
import autobind from 'class-autobind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { connect } from 'react-redux';
import authActions from '../actions/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/auth';
import Spinner from '../components/Spinner';
import BackBoneLogo from '../images/logo.png';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import constants from '../utils/constants';
import relativeDimensions from '../utils/relativeDimensions';
import appActions from '../actions/app';
import theme from '../styles/theme';

const { applyWidthDifference, height } = relativeDimensions;
// Android statusbar height
const statusBarHeightDroid = StatusBar.currentHeight;
const isiOS = Platform.OS === 'ios';

class Reset extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.object,
    passwordResetSent: PropTypes.bool,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      email: null,
      emailWarning: '',
      containerHeight: 0,
      logoHeight: applyWidthDifference(70),
    };
  }

  componentWillMount() {
    const kbShow = isiOS ? 'keyboardWillShow' : 'keyboardDidShow';
    const kbHide = isiOS ? 'keyboardWillHide' : 'keyboardDidHide';

    this.keyboardWillShowListener = Keyboard.addListener(
      kbShow,
      this.keyboardDidShow
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      kbHide,
      this.keyboardDidHide
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.passwordResetSent && nextProps.passwordResetSent) {
      // Pop up an alert and have user check their inbox to confirm
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Success',
          color: theme.green400,
        },
        detail: {
          caption: 'We sent you a password reset link. ' +
          'Please check your email and use the link to reset your password.',
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
    }
  }

  componentWillUnmount() {
    if (this.keyboardWillShowListener) {
      this.keyboardWillShowListener.remove();
    }
    if (this.keyboardWillHideListener) {
      this.keyboardWillHideListener.remove();
    }
  }

  onEmailChange(email) {
    this.setState({ email });
  }

  keyboardDidShow(e) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // apply styles when keyboard is open
    this.setState({
      containerHeight: e.endCoordinates.height,
      logoHeight: applyWidthDifference(0),
    });
  }

  keyboardDidHide() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // apply styles when keyboard is close
    this.setState({ containerHeight: 0, logoHeight: applyWidthDifference(70) });
  }

  sendPasswordResetRequest() {
    const { email } = this.state;
    const validEmail = constants.emailRegex.test(email);

    if (!validEmail) {
      return this.setState({
        emailWarning: 'INVALID EMAIL',
      });
    }

    this.props.dispatch(authActions.reset({ email }));
  }

  render() {
    const { email, emailWarning, containerHeight, logoHeight } = this.state;
    const { warningColor, primaryFontColor, inputIconColor } = theme;
    let newHeight = height - containerHeight - theme.statusBarHeight;

    if (!isiOS) {
      newHeight -= statusBarHeightDroid;
    }
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { height: newHeight }]}>
          {this.props.inProgress
            ? <Spinner />
            : <View>
              <View style={styles.innerContainer}>
                <Image
                  source={BackBoneLogo}
                  style={[styles.backboneLogo, { height: logoHeight }]}
                />
                <HeadingText size={2} style={styles.headingText}>
                  Password Recovery
                </HeadingText>
                <BodyText style={styles.subHeadingText}>
                  Please enter your email address below and we'll send you a link
                  to reset your password.
                </BodyText>
                <View style={styles.inputFieldContainer}>
                  <Input
                    style={[styles.inputField, {
                      color: emailWarning ? warningColor : primaryFontColor,
                    }]}
                    iconStyle={{ color: emailWarning ? warningColor : inputIconColor }}
                    autoCapitalize="none"
                    placeholder="Email"
                    keyboardType="email-address"
                    onChangeText={this.onEmailChange}
                    value={this.state.email}
                    onSubmitEditing={!email ? null : this.sendPasswordResetRequest}
                    autoCorrect={false}
                    returnKeyType="go"
                    iconFont="MaterialIcon"
                    iconLeftName="email"
                  />
                </View>
                {
                  (emailWarning) ?
                    <View style={styles.warningContainer}>
                      <Icon
                        name={'warning'}
                        color={warningColor}
                        size={20}
                      />
                      <BodyText style={styles.warning}>
                        {emailWarning}
                      </BodyText>
                    </View>
                    : null
                  }
                <Button
                  disabled={!email}
                  style={styles.CTAResetBtn}
                  primary
                  text="RESET"
                  onPress={this.sendPasswordResetRequest}
                />
                <TouchableOpacity
                  onPress={() => this.props.navigator.pop()}
                  activeOpacity={0.4}
                >
                  <SecondaryText style={styles.cancel}>
                    Cancel
                  </SecondaryText>
                </TouchableOpacity>
              </View>
            </View>}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapPropsToState = state => {
  const { auth } = state;
  return auth;
};

export default connect(mapPropsToState)(Reset);
