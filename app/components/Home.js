import React from 'react';
import {
  View,
  Image,
  TouchableHighlight,
} from 'react-native';
import logo from '../images/logo.png';
import styles from '../styles/home';

const Home = () => (
  <View style={styles.container}>
    <Image style={styles.logo} source={logo} />
  </View>
);

Home.propTypes = {
  navigator: React.PropTypes.object,
};
