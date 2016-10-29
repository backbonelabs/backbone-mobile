import React from 'react';
import {
  View,
  Image,
} from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/onboarding/device';
import HeadingText from '../../components/HeadingText';
import sensor from '../../images/onboarding/sensor.png';
import routes from '../../routes';

const { PropTypes } = React;

const Device = props => (
  <View key={props.key} style={styles.container}>
    <View style={styles.headerTextContainer}>
      <HeadingText size={2}>Connect Your Backbone</HeadingText>
    </View>
    <View style={styles.imageContainer}>
      <Image source={sensor} />
    </View>
    <View style={styles.buttonContainer}>
      <View style={{ alignItems: 'center' }}>
        <Button text="CONNECT" onPress={() => props.navigator.push(routes.deviceConnect)} />
      </View>
      <View style={{ alignItems: 'center', paddingTop: 15 }}>
        <Button
          style={styles._secondaryButton}
          text="BACK"
          textStyle={styles._secondaryButtonText}
          onPress={props.previousStep}
        />
      </View>
    </View>
  </View>
);

Device.propTypes = {
  key: PropTypes.number,
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
  isConnected: PropTypes.bool,
  dispatch: PropTypes.func,
  inProgress: PropTypes.bool,
  errorMessage: PropTypes.string,
  previousStep: PropTypes.func,
};

export default Device;
