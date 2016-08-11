import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight,
} from 'react-native';
import logo from '../images/logo.png';
import styles from '../styles/home';

const Home = () => (
  <View style={styles.container}>
    <Image style={styles.logo} source={logo} />
    <TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
      <Text style={styles.buttonText}>CONNECT</Text>
    </TouchableHighlight>
  </View>
);

Home.propTypes = {
  navigator: React.PropTypes.object,
};

export default Home;
