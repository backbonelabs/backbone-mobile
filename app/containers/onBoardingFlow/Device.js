import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/onBoarding/device';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';

const { PropTypes } = React;

const Device = props => (
  <View key={props.key} style={styles.container}>
    <View style={styles.headerTextContainer}>
      <HeadingText size={3}>Connect Your Backbone</HeadingText>
    </View>
    <View style={styles.subTextContainer}>
      <SecondaryText style={styles._subText}>
        [ CONNECT INSTRUCTIONS ]
      </SecondaryText>
    </View>
    <View style={styles.imageContainer}>
      <Text style={{ textAlign: 'center' }}>[ BACKBONE DEVICE IMAGE ]</Text>
    </View>
    <View style={styles.primaryButtonContainer}>
      <Button text="NEXT" />
    </View>
  </View>
);

Device.propTypes = {
  key: PropTypes.number,
  navigator: PropTypes.shape({
    replace: PropTypes.func,
    popToTop: PropTypes.func,
  }),
  isConnected: PropTypes.bool,
  dispatch: PropTypes.func,
  inProgress: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default Device;
