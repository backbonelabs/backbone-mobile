import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/connectError';

function ConnectError(props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" />
      <View style={styles.header}>
        <Icon size={150} name="warning" color="black" />
      </View>
      <View style={styles.body}>
        <Text style={styles.errorCode}>
          Error {props.currentRoute.errorCode}
        </Text>
        <Text style={styles.errorMessage}>
          {props.currentRoute.errorMessage}
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={props.navigator.popToTop}>
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

ConnectError.propTypes = {
  navigator: React.PropTypes.object,
  currentRoute: React.PropTypes.object,
  errorCode: React.PropTypes.string,
  errorMessage: React.PropTypes.string,
};

export default ConnectError;
