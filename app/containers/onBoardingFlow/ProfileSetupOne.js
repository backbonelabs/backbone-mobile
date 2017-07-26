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
import Input from '../../components/Input';
import StepBar from '../../components/StepBar';
import femaleIcon from '../../images/onboarding/female-icon-off.png';
import femaleIconOn from '../../images/onboarding/female-icon-on.png';
import maleIcon from '../../images/onboarding/male-icon-off.png';
import maleIconOn from '../../images/onboarding/male-icon-on.png';
import transgenderIcon from '../../images/onboarding/transgender-icon-off.png';
import transgenderIconOn from '../../images/onboarding/transgender-icon-on.png';

const isiOS = Platform.OS === 'ios';
const statusBarHeightDroid = StatusBar.currentHeight;
const { height } = relativeDimensions;

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
    this.setState({ gender: 1 });
  }

  handleOnFemalePress() {
    this.setState({ gender: 2 });
  }

  handleOnTransgenderPress() {
    this.setState({ gender: 3 });
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
        step: 2,
      },
    });
  }

  render() {
    const { containerHeight, gender, nickname } = this.state;
    let newHeight = height - containerHeight - theme.statusBarHeight - theme.titleBarHeight;
    const androidInputContainer = {};

    // Android styles
    if (!isiOS) {
      newHeight -= statusBarHeightDroid;
      if (containerHeight) {
        androidInputContainer.flex = 1;
      }
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles._container}>
          <View style={{ height: newHeight }}>
            <View style={styles.innerContainer}>
              <StepBar step={1} style={styles._stepBar} />
              {
                containerHeight ? null :
                  <BodyText style={styles._header}>
                    Welcome to Backbone! Please help us get to know you a little bit.
                  </BodyText>
              }
              <Input
                iconStyle={{ color: 'black' }}
                containerStyles={androidInputContainer}
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
              <View style={styles.genderContainer}>
                <TouchableHighlight
                  onPress={this.handleOnMalePress}
                  underlayColor={'transparent'}
                  activeOpacity={1}
                >
                  <View>
                    <Image
                      style={styles.gender}
                      source={gender === 1 ? maleIconOn : maleIcon}
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
                      source={gender === 2 ? femaleIconOn : femaleIcon}
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
                      source={gender === 3 ? transgenderIconOn : transgenderIcon}
                    />
                    <Text style={styles.genderLabel}>OTHER</Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
            <View style={styles.CTAContainer}>
              <Button
                style={styles._CTAButton}
                text="CONTINUE"
                primary
                disabled={!nickname || !gender}
                onPress={this.continue}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default ProfileSetupOne;