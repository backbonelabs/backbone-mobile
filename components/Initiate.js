import React, { Component } from 'react';
import Main from './Main';
import Devices from './Devices';
import logo from '../images/logo.png';

import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  NativeModules,
  TouchableHighlight,
} from 'react-native';

const DeviceManagementService = NativeModules.DeviceManagementService;

const styles = StyleSheet.create({
  container: {
    marginTop: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  button: {
    height: 75,
    width: 275,
    marginTop: 150,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '#48BBEC',
  },
  buttonText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

class Initiate extends Component {
  constructor() {
    super();

    this.state = {
      devices: false,
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
        this.props.navigator.push({
          component: Devices,
        });
      } else {
        this.props.navigator.push({
          name: 'main',
          component: Main,
        });
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
