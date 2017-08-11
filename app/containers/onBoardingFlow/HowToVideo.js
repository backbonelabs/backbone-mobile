import React, { PropTypes } from 'react';
import { View, WebView } from 'react-native';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import styles from '../../styles/onBoardingFlow/deviceSetup';
import StepBar from '../../components/StepBar';
import Spinner from '../../components/Spinner';
import routes from '../../routes';
import theme from '../../styles/theme';

const showSpinner = () => <Spinner color={theme.secondaryColor} />;
const showErrorMessage = () => (
  <BodyText>An error has occur, Please try again later</BodyText>
);

const HowToVideo = (props) => (
  <View style={styles.howToContainer}>
    <StepBar step={4} style={styles._stepBar} />
    <View style={styles.howToInnerContainer}>
      <WebView
        style={styles.howToVideo}
        source={{
          uri: 'https://www.youtube.com/embed/Uo27rJAjriw?rel=0&autoplay=0&showinfo=0&controls=0' }}
        javaScriptEnabled
        startInLoadingState
        renderLoading={showSpinner}
        renderError={showErrorMessage}
      />
    </View>
    <View style={styles.btnContainer}>
      <View style={styles.CTAContainer}>
        <Button
          style={styles._CTAButton}
          text="Done"
          primary
          onPress={() => props.navigator.resetTo(routes.dashboard)}
        />
      </View>
    </View>
  </View>
);

HowToVideo.propTypes = {
  navigator: PropTypes.shape({
    resetTo: PropTypes.func,
  }),
};

export default HowToVideo;
