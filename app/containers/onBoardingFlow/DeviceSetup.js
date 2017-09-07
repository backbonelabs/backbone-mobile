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
  const setup = () => navigator.push({ ...routes.deviceScan, props: { showSkip: true } });

  return (
    <View style={styles.container}>
      <StepBar step={3} style={styles.stepBar} />
      <BodyText style={styles.deviceSetup_header}>
        Excellent! Now let's connect your device.
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
            style={styles.CTAButton}
            text="SET UP DEVICE"
            primary
            onPress={setup}
          />
        </View>
        <TouchableOpacity
          onPress={skip}
          activeOpacity={0.4}
        >
          <SecondaryText style={styles.skip}>
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
