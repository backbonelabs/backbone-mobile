import React, { Component, PropTypes } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import autobind from 'class-autobind';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/deviceSetup';
import StepBar from '../../components/StepBar';
import SecondaryText from '../../components/SecondaryText';
import deviceIcon from '../../images/onboarding/device-icon-lg.png';
import routes from '../../routes';
import Mixpanel from '../../utils/Mixpanel';

class DeviceSetup extends Component {
  constructor() {
    super();
    autobind(this);
  }

  componentWillMount() {
    Mixpanel.track('deviceSetup');
  }

  setup() {
    this.props.navigator.push({ ...routes.deviceScan, props: { showSkip: true } });
  }

  skip() {
    this.props.navigator.push(routes.howToVideo);
    Mixpanel.track('deviceSetup-skip');
  }

  render() {
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
              onPress={this.setup}
            />
          </View>
          <TouchableOpacity
            onPress={this.skip}
            activeOpacity={0.4}
          >
            <SecondaryText style={styles.skip}>
            Skip Setup
            </SecondaryText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

DeviceSetup.propTypes = {
  navigator: PropTypes.object,
  step: PropTypes.number,
};

export default DeviceSetup;
