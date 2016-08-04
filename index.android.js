/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import {
  AppRegistry,
  Text,
  View,
} from 'react-native';
import styles from './app/styles/indexAndroid';

const Backbone = () => (
  <View style={styles.container}>
    <Text style={styles.welcome}>
      Welcome to React Native!
    </Text>
    <Text style={styles.instructions}>
      To get started, edit index.android.js
    </Text>
    <Text style={styles.instructions}>
      Shake or press menu button for dev menu
    </Text>
  </View>
);

AppRegistry.registerComponent('backbone', () => Backbone);
