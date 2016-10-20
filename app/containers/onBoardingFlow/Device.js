import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';
import styles from '../../styles/onBoarding/device';

const Device = props => (
  <View key={props.key} onPress={props.onPress} style={styles.container}>
    <View style={styles.headerTextContainer}>
      <HeadingText size={3}>Connect Your Backbone</HeadingText>
    </View>
    <View style={styles.subTextContainer}>
      <SecondaryText style={styles._subText}>
        [ CONNECT INSTRUCTIONS ]
      </SecondaryText>
    </View>
    <View>
      <Text style={styles.primaryButtonText}>[ BACKBONE DEVICE IMAGE ]</Text>
    </View>
    <View style={styles.primaryButtonContainer}>
      <TouchableOpacity style={styles.primaryButton} onPress={props.onPress}>
        <Text style={styles.primaryButtonText}>NEXT</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const { PropTypes } = React;

Device.propTypes = {
  key: PropTypes.number,
  onPress: PropTypes.func,
  currentStep: PropTypes.number,
};

export default Device;
