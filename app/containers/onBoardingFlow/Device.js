import React, { PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/device';
import HeadingText from '../../components/HeadingText';
import sensor from '../../images/onboarding/sensor.png';
import routes from '../../routes';

const Device = props => (
  <View key={props.key} style={styles.container}>
    <View style={styles.headerTextContainer}>
      <HeadingText size={2}>Connect Your Backbone</HeadingText>
    </View>
    <View style={styles.imageContainer}>
      <Image source={sensor} />
    </View>
    <View style={styles.buttonContainer}>
      <Button
        primary
        style={styles._button}
        text="CONNECT"
        onPress={() => props.navigator.push(routes.deviceScan)}
      />
      <View style={{ paddingTop: 15 }}>
        <Button
          style={styles._button}
          text="BACK"
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
  previousStep: PropTypes.func,
};

export default Device;
