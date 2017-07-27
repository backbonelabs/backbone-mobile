import React, { PropTypes } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/deviceSetup';
import StepBar from '../../components/StepBar';
import SecondaryText from '../../components/SecondaryText';
import deviceIcon from '../../images/onboarding/device-icon-lg.png';
import routes from '../../routes';

const DeviceSetup = ({ navigator }) => {
  const skip = () => navigator.push(routes.howToVideo);
  const setup = () => navigator.push(routes.setupDevice);

  return (
    <View style={styles._container}>
      <StepBar step={3} style={styles._stepBar} />
      <BodyText>
          Excellent! Now let's Connect your Device
      </BodyText>
      <View style={styles.innerContainer}>
        <Image
          style={styles.image}
          source={deviceIcon}
        />
      </View>
      <View style={styles.btnContainer}>
        <View style={styles.CTAContainer}>
          <Button
            style={styles._CTAButton}
            text="SETUP DEVICE"
            primary
            onPress={setup}
          />
        </View>
        <TouchableOpacity
          onPress={skip}
          activeOpacity={0.4}
        >
          <SecondaryText style={styles._skip}>
              Skip Setup
          </SecondaryText>
        </TouchableOpacity>
      </View>
    </View>
    );
};

DeviceSetup.propTypes = {
  navigator: PropTypes.object,
  step: PropTypes.number,
};

export default DeviceSetup;
