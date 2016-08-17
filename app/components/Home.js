import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import logo from '../images/logo.png';
import bg from '../images/bg.jpg';
import styles from '../styles/home';
import routes from '../routes/';

function Home(props) {
  return (
    <View style={styles.container}>
      <Image style={styles.background} source={bg} />
      <View style={styles.header}>
        <Image style={styles.logo} source={logo} />
      </View>
      <View style={styles.body}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => { props.navigator.push(routes.deviceConnect); }}
        >
          <Text style={styles.connect}>Connect</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.signup}>Don't have an account? Sign-up</Text>
      </View>
    </View>
  );
}

Home.propTypes = {
  navigator: React.PropTypes.object,
};

export default Home;
