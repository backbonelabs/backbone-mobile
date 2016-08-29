import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../../styles/device/deviceError';

export default function DeviceError(props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon size={150} name="warning" color="black" />
      </View>
      <View style={styles.body}>
        <Text style={styles.errorCode}>
          Error {props.deviceError.code}
        </Text>
        <Text style={styles.errorMessage}>
          {props.deviceError.message}
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={props.retryConnect}>
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      </View>
      { props.deviceError.remembered ?
        (<TouchableOpacity style={styles.subFooter} onPress={props.forgetDevice}>
          <Icon size={20} name="chain-broken" color="black" />
          <Text style={styles.forgetDevice}>Forget Device</Text>
        </TouchableOpacity>) :
        <View style={styles.subFooter} />
      }
    </View>
  );
}

DeviceError.propTypes = {
  forgetDevice: React.PropTypes.func,
  retryConnect: React.PropTypes.func,
  deviceError: React.PropTypes.object,
};
