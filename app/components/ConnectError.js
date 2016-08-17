import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/connectError';

export default function ConnectError(props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" />
      <View style={styles.header}>
        <Icon size={150} name="warning" color="black" />
      </View>
      <View style={styles.body}>
        <Text style={styles.errorCode}>
          Error {props.errorInfo.code}
        </Text>
        <Text style={styles.errorMessage}>
          {props.errorInfo.message}
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={props.retry}>
          <Text style={styles.retry}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
      { props.errorInfo.remembered ?
        (<TouchableOpacity style={styles.subFooter} onPress={props.forget}>
          <Icon size={20} name="chain-broken" color="black" />
          <Text style={styles.forgetDevice}>Forget Device</Text>
        </TouchableOpacity>) :
        <View style={styles.subFooter} />
      }
    </View>
  );
}

ConnectError.propTypes = {
  errorInfo: React.PropTypes.object,
  retry: React.PropTypes.func,
  forget: React.PropTypes.func,
};
