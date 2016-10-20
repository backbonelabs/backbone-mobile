import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import styles from '../../styles/onBoarding/notifications';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';

const Notifications = props => (
  <View key={props.key} onPress={props.onPress} style={styles.container}>
    <View style={styles.headerTextContainer}>
      <HeadingText size={3}>Get Reminders</HeadingText>
    </View>
    <View style={styles.subTextContainer}>
      <SecondaryText style={styles._subText}>
        Notifications are a quick and easy way to be notified whenever you slouch!
      </SecondaryText>
    </View>
    <View style={styles.primaryButtonContainer}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => Linking.openURL('app-settings:')}
      >
        <Text style={styles.primaryButtonText}>ENABLE NOTIFICATIONS</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.secondaryButtonContainer}>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={props.onPress}
      >
        <Text style={styles.secondaryButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const { PropTypes } = React;

Notifications.propTypes = {
  key: PropTypes.number,
  onPress: PropTypes.func,
  currentStep: PropTypes.number,
};

export default Notifications;
