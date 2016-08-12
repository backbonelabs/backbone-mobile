import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  NativeModules,
  ActivityIndicator,
  TouchableHighlight,
  NativeAppEventEmitter,
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
        color="#e73e3a"
      />
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
  }

  initiateConnect() {
    DeviceManagementService.checkForSavedDevice((response) => {
      if (response) {
        this.setState({
          connecting: true,
        }, () => {
          const deviceConnectionStatus = NativeAppEventEmitter.addListener('Status', (status) => {
            if (status === 1) {
              this.props.navigator.push(routes.posture);
            } else {
              // navigate to error route
            }
            deviceConnectionStatus.remove();
          });
        });
      } else {
        this.props.navigator.push(routes.devices);
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo} />
        <TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableHighlight>
        <Modal animationType="slide" visible={this.state.connecting} transparent>
          <ModalBody status={this.state.status} />
        </Modal>
      </View>
    );
  }
}
