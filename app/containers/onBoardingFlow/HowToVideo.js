import React, { PropTypes } from 'react';
import { View } from 'react-native';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/deviceSetup';
import StepBar from '../../components/StepBar';
import routes from '../../routes';
import VideoPlayer from '../../components/VideoPlayer';

const HowToVideo = (props) => (
  <View style={styles.howToContainer}>
    <StepBar step={4} style={styles._stepBar} />
    <BodyText style={styles._howToHeader}>
      Tutorial
    </BodyText>
    <View style={styles.howToInnerContainer}>
      <VideoPlayer
        video={{ uri: 'https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4' }} // video example
      />
    </View>
    <View style={styles.btnContainer}>
      <View style={styles.CTAContainer}>
        <Button
          style={styles._CTAButton}
          text="Done"
          primary
          onPress={() => props.navigator.replace(routes.postureDashboard)}
        />
      </View>
    </View>
  </View>
);

HowToVideo.propTypes = {
  navigator: PropTypes.shape({
    replace: PropTypes.func,
  }),
};

export default HowToVideo;
