import React, { Component } from 'react';
import Main from './Main.react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  statusBar: {
    height: 22,
    backgroundColor: '#48BBEC',
  },
  container: {
    marginTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 300,
    width: 300,
  },
  button: {
    marginTop: 60,
    height: 60,
    width: 300,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '#48BBEC',
  },
  buttonText: {
    fontSize: 30,
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
});

class Initiate extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
    };

    this.initiateConnect = this.initiateConnect.bind(this);
  }

  initiateConnect() {
    this.props.navigator.push({
      component: Main,
    });
  }

  render() {
    return (
      <View>
        <View style={styles.statusBar} />
        <View style={styles.container}>
          <Image style={styles.logo} source={require('../images/logo.png')} />
          <TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
            <Text style={styles.buttonText}>
              CONNECT
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

Initiate.propTypes = {
  navigator: React.PropTypes.object,
};

export default Initiate;
