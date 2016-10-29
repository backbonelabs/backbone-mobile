import React from 'react';
import {
  View,
  Image,
} from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/onBoarding/device';
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
      <View>
        <Button
          style={{ alignSelf: 'center' }}
          text="CONNECT"
          onPress={() => props.navigator.push(routes.deviceConnect)}
        />
      </View>
      <View style={{ paddingTop: 15 }}>
        <Button
          style={{ alignSelf: 'center' }}
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
  previousStep: PropTypes.func,
};

export default Device;
