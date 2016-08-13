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

const ModalContent = () => (
  <View style={styles.modalContentContainer}>
    <View style={styles.modalContentBody}>
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
      modalVisible: false,
    };

    this.checkForSavedDevice = this.checkForSavedDevice.bind(this);
    this.initiateConnection = this.initiateConnection.bind(this);
  }

  componentWillMount() {
    DeviceManagementService.getDeviceStatus((status) => {
      if (status === 2) {
        this.props.navigator.push(routes.posture);
      }
    });
  }

  checkForSavedDevice() {
    DeviceManagementService.getSavedDevice((savedDevice) => {
      if (savedDevice) {
        this.initiateConnection();
      } else {
        this.props.navigator.push(routes.devices);
      }
    });
  }

  initiateConnection() {
    this.setState({ modalVisible: true }, () => {
      NativeAppEventEmitter.once('Status', (status) => {
        this.setState({ modalVisible: false }, () => {
          if (status.code === 2) {
            this.props.navigator.push(routes.posture);
          } else {
            // navigate to error route
          }
        });
      });
      DeviceManagementService.connectToDevice();
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo} />
        <TouchableHighlight style={styles.button} onPress={this.checkForSavedDevice}>
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableHighlight>
        <Modal animationType="slide" visible={this.state.modalVisible} transparent>
          <ModalContent />
        </Modal>
      </View>
    );
  }
}
