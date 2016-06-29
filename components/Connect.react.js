import React, { Component } from 'react';

import {
  View,
  Text,
  Animated,
  StyleSheet,
  NativeModules,
  ActivityIndicator,
} from 'react-native';

const MetaWearAPI = NativeModules.MetaWearAPI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 200,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
    color: '#48BBEC',
    fontWeight: 'bold',
  },
});

class ConnectView extends Component {
  constructor() {
    super();
    this.state = {
      fadeAnim: new Animated.Value(0),
    };

    this.initiateMetaWear = this.initiateMetaWear.bind(this);
  }

  componentDidMount() {
    this.initiateMetaWear();

    const context = this;

    (function cycleAnimation() {
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(
        context.state.fadeAnim,
        { toValue: 1 }),
        Animated.delay(200),
        Animated.timing(
        context.state.fadeAnim,
        { toValue: 0 }),
      ]).start(() => {
        if (!context.props.connected) {
          cycleAnimation();
        }
      });
    }());
  }

  initiateMetaWear() {
    MetaWearAPI.connectToMetaWear(() => {
      this.props.connected();
    });
  }

  render() {
    const animatedStyle = { opacity: this.state.fadeAnim, marginBottom: 25 };

    return (
      <View style={styles.container}>
        <Animated.View style={animatedStyle}>
          <ActivityIndicator
            hidden
            size="large"
          />
        </Animated.View>
        <Text style={styles.text}>
          CONNECTING...
        </Text>
      </View>
    );
  }
}

ConnectView.propTypes = {
  connected: React.PropTypes.func,
};

export default ConnectView;
