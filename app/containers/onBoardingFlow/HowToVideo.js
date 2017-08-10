import React, { PropTypes } from 'react';
import { WebView, View } from 'react-native';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import styles from '../../styles/onBoarding/device';
import HeadingText from '../../components/HeadingText';

import routes from '../../routes';

const showSpinner = () => <Spinner />;
const showErrorMessage = () => (
  <BodyText>An error has occur, Please try again later</BodyText>
);

const HowToVideo = (props) => (
  <View key={props.key} style={styles.container}>
    <View style={styles.headerTextContainer}>
      <HeadingText size={2}>Tutorial</HeadingText>
    </View>
    {props.step === 2 ? <WebView
      source={{
        uri: 'https://www.youtube.com/embed/Uo27rJAjriw?rel=0&autoplay=0&showinfo=0&controls=0' }}
      javaScriptEnabled
      startInLoadingState
      renderLoading={showSpinner}
      renderError={showErrorMessage}
    /> : null}
    <View style={styles.buttonContainer}>
      <Button
        primary
        style={styles._button}
        text="DONE"
        onPress={() => props.navigator.replace(routes.dashboard)}
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

HowToVideo.propTypes = {
  key: PropTypes.number,
  step: PropTypes.number,
  navigator: PropTypes.shape({
    replace: PropTypes.func,
  }),
  previousStep: PropTypes.func,
};

export default HowToVideo;
