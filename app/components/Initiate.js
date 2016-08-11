import React, { Component } from 'react';
import logo from '../images/logo.png';
import {
  View,
  Text,
  Image,
  Animated,
  NativeModules,
  TouchableHighlight,
} from 'react-native';
import routes from '../routes';
import styles from '../styles/initiate';

const DeviceManagementService = NativeModules.DeviceManagementService;

class Initiate extends Component {
  constructor() {
    super();

    this.state = {
      logoAnimValue: 300,
      logoAnim: new Animated.Value(300),
      buttonAnim: new Animated.ValueXY(),
    };

    this.initiateConnect = this.initiateConnect.bind(this);
    this.connectAnimation = this.connectAnimation.bind(this);
    this.buttonEnterAnimation = this.buttonEnterAnimation.bind(this);
  }

  componentDidMount() {
    this.buttonEnterAnimation();
  }

  initiateConnect() {
    this.connectAnimation();

    this.state.logoAnim.addListener((value) => {
      this.setState({
        logoAnimValue: value.value,
      });
    });

    DeviceManagementService.checkForSavedDevice((error, response) => {
      if (error) {
        console.log('Error: ', error);
      } else if (!response) {
        this.props.navigator.push(routes.devices);
      } else {
        this.props.navigator.push(routes.posture);
      }
    });
  }

  connectAnimation() {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(
      this.state.logoAnim,
      { toValue: 0 }),
    ]).start();
  }

  buttonEnterAnimation() {
    Animated.sequence([
      Animated.spring(this.state.buttonAnim, {
        tension: 5,
        friction: 2,
        toValue: { x: 0, y: -110 },
      }),
    ]).start();
  }

  render() {
    const logoDimensions = {
      height: this.state.logoAnim,
      width: this.state.logoAnim,
      marginTop: 300 - this.state.logoAnim,
    };
    return (
      <View style={styles.container}>
        <Animated.Image style={logoDimensions} source={logo} />
        <Animated.View style={{ transform: this.state.buttonAnim.getTranslateTransform() }}>
          <TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
            <Text style={styles.buttonText}>CONNECT</Text>
          </TouchableHighlight>
        </Animated.View>
      </View>
    );
  }
}

Initiate.propTypes = {
  navigator: React.PropTypes.object,
};

export default Initiate;
