import React, { Component } from 'react';
import Main from './Main';
import logo from '../images/logo.png';
import {
  View,
  Text,
  Image,
  Animated,
  NativeModules,
  TouchableHighlight,
  NativeAppEventEmitter,
} from 'react-native';
import styles from '../styles/initiate';

const MetaWearAPI = NativeModules.MetaWearAPI;

class Initiate extends Component {
  constructor() {
    super();

    this.state = {
      connected: false,
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

    MetaWearAPI.searchForMetaWear((error, response) => {
      if (error) {
        console.log('Error: ', error);
      } else {
        this.setState({
          connected: response,
        }, () => {
          this.props.navigator.push({
            name: 'main',
            component: Main,
            passProps: { MetaWearAPI },
          });
        });
      }
    });

    const listenToDevices = NativeAppEventEmitter.addListener('Devices', (event) => {
      console.log('Devices: ', event);
    });
  }

  connectAnimation() {
    const context = this;

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(
      context.state.logoAnim,
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
