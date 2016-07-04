import React, { Component } from 'react';
import Main from './Main.react';
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

const MetaWearAPI = NativeModules.MetaWearAPI;

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 300,
    width: 300,
  },
  button: {
    marginTop: 50,
    height: 75,
    width: 275,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '#48BBEC',
  },
  buttonText: {
    fontSize: 32,
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
});

class Initiate extends Component {
  constructor() {
    super();

    this.state = {
      connected: false,
      fadeAnim: new Animated.Value(1),
    };

    this.cycleAnimation = this.cycleAnimation.bind(this);
    this.initiateConnect = this.initiateConnect.bind(this);
  }

  cycleAnimation() {
    const context = this;

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(
      context.state.fadeAnim,
      { toValue: 0 }),
      Animated.delay(200),
      Animated.timing(
      context.state.fadeAnim,
      { toValue: 1 }),
    ]).start(() => {
      if (!context.state.connected) {
        context.cycleAnimation();
      }
    });
  }

  initiateConnect() {
    this.cycleAnimation();

    MetaWearAPI.searchForMetaWear(() => {
      this.setState({
        connected: true,
      }, () => {
        this.props.navigator.push({
          name: 'Main',
          component: Main,
          passProps: { MetaWearAPI },
        });
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.Image style={[styles.logo, { opacity: this.state.fadeAnim }]} source={logo} />
        <TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
          <Text style={styles.buttonText}>CONNECT</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

Initiate.propTypes = {
  navigator: React.PropTypes.object,
};

export default Initiate;
