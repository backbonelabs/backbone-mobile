import React, { Component, PropTypes } from 'react';
import { View } from 'react-native';
import autobind from 'class-autobind';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/deviceSetup';
import StepBar from '../../components/StepBar';
import routes from '../../routes';
import VideoPlayer from '../../components/VideoPlayer';
import Mixpanel from '../../utils/Mixpanel';

class HowToVideo extends Component {
  constructor() {
    super();
    autobind(this);
  }

  componentWillMount() {
    Mixpanel.track('howToVideo');
  }

  navigateToDashboard() {
    this.props.navigator.resetTo(routes.dashboard);
  }

  render() {
    return (
      <View style={styles.howToContainer}>
        <StepBar step={4} style={styles.stepBar} />
        <View style={styles.howToInnerContainer}>
          <VideoPlayer
            defaultFullscreen
            video={{ uri: 'https://cdn.gobackbone.com/workout-videos/how-to-use.mp4' }}
          />
        </View>
        <View style={styles.btnContainer}>
          <View style={styles.CTAContainer}>
            <Button
              style={styles.CTAButton}
              text="Done"
              primary
              onPress={this.navigateToDashboard}
            />
          </View>
        </View>
      </View>
    );
  }
}

HowToVideo.propTypes = {
  navigator: PropTypes.shape({
    resetTo: PropTypes.func,
  }),
};

export default HowToVideo;
