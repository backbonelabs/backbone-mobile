import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  LayoutAnimation,
  StatusBar,
  Image,
  Text,
  TouchableHighlight,
} from 'react-native';
import autobind from 'class-autobind';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/profileSetup';
import theme from '../../styles/theme';
import routes from '../../routes';
import relativeDimensions from '../../utils/relativeDimensions';
import constants from '../../utils/constants';
import Input from '../../components/Input';
import StepBar from '../../components/StepBar';
import femaleIcon from '../../images/onboarding/female-icon-off.png';
import femaleIconOn from '../../images/onboarding/female-icon-on.png';
import maleIcon from '../../images/onboarding/male-icon-off.png';
import maleIconOn from '../../images/onboarding/male-icon-on.png';
import transgenderIcon from '../../images/onboarding/transgender-icon-off.png';
import transgenderIconOn from '../../images/onboarding/transgender-icon-on.png';
import Mixpanel from '../../utils/Mixpanel';

const isiOS = Platform.OS === 'ios';
const statusBarHeightDroid = StatusBar.currentHeight;
const { height, applyWidthDifference } = relativeDimensions;
const { male, female, other } = constants.gender;

class ProfileSetupOne extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      nickname: '',
      gender: '',
      containerHeight: 0,
    };
  }

  componentWillMount() {
    const kbShow = isiOS ? 'keyboardWillShow' : 'keyboardDidShow';
    const kbHide = isiOS ? 'keyboardWillHide' : 'keyboardDidHide';
    Mixpanel.track('profileSetupOne');

    this.keyboardWillShowListener = Keyboard.addListener(
      kbShow,
      this.keyboardDidShow
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      kbHide,
      this.keyboardDidHide
    );
  }

  componentWillUnmount() {
    if (this.keyboardWillShowListener) {
      this.keyboardWillShowListener.remove();
    }
    if (this.keyboardWillHideListener) {
      this.keyboardWillHideListener.remove();
    }
  }

  onNicknameChange(nickname) {
    return this.setState({ nickname });
  }

  handleOnMalePress() {
    this.setState({ gender: male });
  }

  handleOnFemalePress() {
    this.setState({ gender: female });
  }

  handleOnTransgenderPress() {
    this.setState({ gender: other });
  }

  keyboardDidShow(e) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // apply styles when keyboard is open
    this.setState({
      containerHeight: e.endCoordinates.height,
    });
  }

  keyboardDidHide() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // apply styles when keyboard is close
    this.setState({
      containerHeight: 0,
    });
  }

  continue() {
    Keyboard.dismiss();
    return this.props.navigator.push({
      ...routes.profileSetupTwo,
      props: {
        nickname: this.state.nickname,
        gender: this.state.gender,
      },
    });
  }

  render() {
    const { containerHeight, gender, nickname } = this.state;
    let newHeight = height - containerHeight - theme.statusBarHeight - theme.titleBarHeight;
    const innerContainerStyle = { justifyContent: null };
    const androidGenderContainer = { marginTop: applyWidthDifference(45) };

    // if keyboard is displayed
    if (containerHeight) {
      innerContainerStyle.justifyContent = 'center';
    }

    // Android styles
    if (!isiOS) {
      newHeight -= statusBarHeightDroid;
      // if keyboard is displayed
      if (containerHeight) {
        androidGenderContainer.marginTop = applyWidthDifference(15);
      }
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={{ height: newHeight }}>
            <View style={[styles.innerContainer, innerContainerStyle]}>
              {
                containerHeight ? null :
                  <View>
                    <StepBar step={1} style={styles.stepBar} />
                    <BodyText style={styles.header}>
                    Welcome to Backbone! Please help us get to know you a little bit.
                    </BodyText>
                  </View>
              }
              <Input
                iconStyle={{ color: 'black' }}
                value={this.state.nickname}
                autoCapitalize="none"
                placeholder="Nickname"
                onChangeText={this.onNicknameChange}
                keyboardType="default"
                autoCorrect={false}
                returnKeyType="next"
                iconFont="MaterialIcon"
                iconLeftName="person"
              />
              <View style={[styles.genderContainer, androidGenderContainer]}>
                <TouchableHighlight
                  onPress={this.handleOnMalePress}
                  underlayColor={'transparent'}
                  activeOpacity={1}
                >
                  <View>
                    <Image
                      style={styles.gender}
                      source={gender === male ? maleIconOn : maleIcon}
                    />
                    <Text style={styles.genderLabel}>MALE</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  onPress={this.handleOnFemalePress}
                  underlayColor={'transparent'}
                  activeOpacity={1}
                >
                  <View>
                    <Image
                      style={styles.gender}
                      source={gender === female ? femaleIconOn : femaleIcon}
                    />
                    <Text style={styles.genderLabel}>FEMALE</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  onPress={this.handleOnTransgenderPress}
                  underlayColor={'transparent'}
                  activeOpacity={1}
                >
                  <View>
                    <Image
                      style={styles.gender}
                      source={gender === other ? transgenderIconOn : transgenderIcon}
                    />
                    <Text style={styles.genderLabel}>OTHER</Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
            <Button
              style={styles.CTAButton}
              text="CONTINUE"
              primary
              disabled={!nickname || !gender}
              onPress={this.continue}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default ProfileSetupOne;
