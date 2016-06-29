import React, { Component } from 'react';
import Posture from './Posture.react';
import Connect from './Connect.react';

import {
  View,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  statusBar: {
    height: 22,
    backgroundColor: '#48BBEC',
  },
});

class Main extends Component {
  constructor() {
    super();
    this.state = {
      connected: false,
    };

    this.updateConnected = this.updateConnected.bind(this);
  }

  updateConnected() {
    this.setState({
      connected: true,
    });
  }

  render() {
    return (
      <View>
        <View style={styles.statusBar} />
        {this.state.connected ?
          <Posture /> :
          <Connect connected={this.updateConnected} />
        }
      </View>
    );
  }
}

export default Main;
