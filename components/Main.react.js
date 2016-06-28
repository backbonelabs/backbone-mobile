import React, { Component } from 'react';
import Activity from './Activity.react';
import Connect from './Connect.react';
import Posture from './Posture.react';

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

    this.connected = this.connected.bind(this);
    this.renderCustomTab = this.renderCustomTab.bind(this);
  }

  connected() {
    this.setState({
      connected: true,
    });
  }

  renderCustomTab() {
    return (
      <CustomTabBar
        activeTextColor="#48BBEC"
        inactiveTextColor="#9da2a7"
        underlineColor="transparent"
        backgroundColor="white"
      />
    );
  }

  render() {
    return (
      <View>
        <View style={styles.statusBar} />
        {this.state.connected ?
          <View>
            <Posture tabLabel="POSTURE" />
            <Activity tabLabel="ACTIVITY" />
          </View> :
          <Connect connected={this.connected} />
        }
      </View>
    );
  }
}

export default Main;
