import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight,
} from 'react-native';
import logo from '../images/logo.png';
import styles from '../styles/home';
import routes from '../routes/';

function Home(props) {
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={logo} />
      <TouchableHighlight
        style={styles.button}
        onPress={() => { props.navigator.push(routes.connect); }}
      >
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableHighlight>
    </View>
  );
}

Home.propTypes = {
  navigator: React.PropTypes.object,
};

export default Home;
