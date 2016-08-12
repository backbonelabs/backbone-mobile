import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  NativeModules,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import logo from '../images/logo.png';
import styles from '../styles/home';
import routes from '../routes';

const DeviceManagementService = NativeModules.DeviceManagementService;

const ModalBody = () => (
  <View style={styles.modalBodyContainer}>
    <View style={styles.modalBodyContent}>
      <ActivityIndicator
        animating
        size="large"
        color="black"
      />
      <Text style={styles.modalBodyTitle}>
        Connecting
      </Text>
    </View>
  </View>
);

export default class Home extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      connecting: false,
    };

    this.initiateConnect = this.initiateConnect.bind(this);
    // this.handleConnectError = this.handleConnectError.bind(this);
    // this.unpairDevice = this.unpairDevice.bind(this);
  }

  initiateConnect() {
    this.setState({
      connecting: true,
    }, () => {
      // DeviceManagementService.checkForSavedDevice((response) => {
      //   if (response) {
      //     Alert.alert(
      //     'Connecting',
      //     'Bah',
      //     );
      //     // this.props.navigator.push(routes.posture);
      //   } else {
      //     this.props.navigator.push(routes.devices);
      //   }
      // });
    });
  }

  // handleConnectError() {
  //   this.setState({
  //     connecting: false,
  //   }, () => {
      // Alert.alert(
      //   'Error!',
      //   'Error!',
      //   [
      //     { text: 'Try Again' },
      //     { text: 'Unpair Backbone', onPress: this.unpairDevice },
      //   ]);
  //   });
  // }

  // unpairDevice() {
  //   DeviceManagementService.forgetDevice();
  // }

  // {this.state.connecting ?
  // (<View style={styles.disabled}>
  //   <ActivityIndicator
  //     animating
  //     color="white"
  //     size="large"
  //   />
  //   <Text style={styles.connectingText}>Connecting...</Text>
  // </View>) :

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo} />
        <TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableHighlight>
        <Modal animationType="slide" visible={this.state.connecting} transparent>
          <ModalBody />
        </Modal>
      </View>
    );
  }
}
