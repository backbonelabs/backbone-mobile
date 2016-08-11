import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  NativeModules,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import logo from '../images/logo.png';
import styles from '../styles/home';
import routes from '../routes';

const DeviceManagementService = NativeModules.DeviceManagementService;

export default class Initiate extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      connecting: false,
    };

    this.initiateConnect = this.initiateConnect.bind(this);
  }

  initiateConnect() {
    this.setState({
      connecting: true,
    }, () => {
      DeviceManagementService.checkForSavedDevice((error, response) => {
        if (error) {
          console.log('Error: ', error);
        } else if (!response) {
          this.props.navigator.push(routes.devices);
        } else {
          this.props.navigator.push(routes.posture);
        }
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo} />
        {this.state.connecting ?
          (<View style={styles.disabled}>
            <ActivityIndicator
              animating
              color="white"
              size="large"
            />
            <Text style={styles.connectingText}>Connecting...</Text>
          </View>) :
          (<TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
            <Text style={styles.buttonText}>Go</Text>
          </TouchableHighlight>)
        }
      </View>
    );
  }
}
