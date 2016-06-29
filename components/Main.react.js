import React, { Component } from 'react';
import Posture from './Posture.react';
import Activity from './Activity.react';
import Connect from './Connect.react';

import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  statusBar: {
    height: 22,
    backgroundColor: '#48BBEC',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtons: {
    width: 125,
    height: 50,
    marginTop: 40,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '#48BBEC',
  },
  navText: {
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
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
          <View style={styles.nav}>
            <TouchableHighlight style={styles.navButtons}>
              <Text style={styles.navText}>POSTURE</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.navButtons}>
              <Text style={styles.navText}>ACTIVITY</Text>
            </TouchableHighlight>
          </View> :
          <Connect connected={this.updateConnected} />
        }
      </View>
    );
  }
}

export default Main;
