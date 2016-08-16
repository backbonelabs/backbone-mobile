import React from 'react';
import {
  View,
  Text,
  StatusBar,
  NativeModules,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/connectError';

const { DeviceManagementService } = NativeModules;

function ConnectError(props) {
  function forgetDevice() {
    DeviceManagementService.forgetDevice(() => {
      props.navigator.popToTop();
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" />
      <View style={styles.header}>
        <Icon size={150} name="warning" color="black" />
      </View>
      <View style={styles.body}>
        <Text style={styles.errorCode}>
          Error {props.currentRoute.code}
        </Text>
        <Text style={styles.errorMessage}>
          {props.currentRoute.message}
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={props.navigator.popToTop}>
          <Text style={styles.retry}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
      { !props.currentRoute.remembered ?
        (<TouchableOpacity style={styles.subFooter} onPress={forgetDevice}>
          <Icon size={20} name="chain-broken" color="black" />
          <Text style={styles.forgetDevice}>Forget Device</Text>
        </TouchableOpacity>) :
        <View style={styles.subFooter} />
      }
    </View>
  );
}

ConnectError.propTypes = {
  navigator: React.PropTypes.object,
  currentRoute: React.PropTypes.object,
  code: React.PropTypes.string,
  message: React.PropTypes.string,
};

export default ConnectError;
