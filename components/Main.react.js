import React, { Component } from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  statusBar: {
    height: 23,
    backgroundColor: '#48BBEC',
  },
});

class Main extends Component {
  render() {
    return (
      <View>
        <View style={styles.statusBar} />
      </View>
    );
  }
}

export default Main;
