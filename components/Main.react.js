import React, { Component } from 'react';
import Posture from './Posture.react';
import Activity from './Activity.react';

import {
  Text,
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
  render() {
    return (
      <View>
        <View style={styles.statusBar} />
        <Text>
          NavBar
        </Text>
      </View>
    );
  }
}

export default Main;
