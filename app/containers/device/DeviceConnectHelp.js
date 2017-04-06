import React, { PropTypes, Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import autobind from 'autobind-decorator';
import styles from '../../styles/device/deviceConnectHelp';

class DeviceConnectHelp extends Component {
  static propTypes = {
    deviceConnectSupport: PropTypes.func,
  };

  @autobind
  handleOnPress() {
    this.props.deviceConnectSupport();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Didn't see your Backbone device?
        </Text>
        <Text style={styles.items}>
          1. Make sure the Backbone device and your smartphone are close to each other.
        </Text>
        <Text style={styles.items}>
          2. Fully charge the Backbone device using the provided USB cable.
        </Text>
        <Text style={styles.items}>
          3. Unpair the Backbone device with any other smartphones.
        </Text>
        <TouchableOpacity onPress={this.handleOnPress}>
          <Text style={styles.help}>Need more help?</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default DeviceConnectHelp;
