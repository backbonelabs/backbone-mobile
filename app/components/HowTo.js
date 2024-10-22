import React from 'react';
import {
  View,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/howTo';
import theme from '../styles/theme';
import HeadingText from '../components/HeadingText';
import Button from '../components/Button';
import howToUseBackbone from '../images/howTo/howToUseBackbone.png';
import howToStartSession from '../images/howTo/howToStartSession.png';
import howToGetBestResults from '../images/howTo/howToGetBestResults.png';
import relativeDimensions from '../utils/relativeDimensions';
import Mixpanel from '../utils/Mixpanel';
import appActions from '../actions/app';

const { applyWidthDifference } = relativeDimensions;
const howToContent = [{
  image: howToUseBackbone,
  title: 'Use Your Backbone',
  width: applyWidthDifference(375),
  height: applyWidthDifference(1423),
}, {
  image: howToStartSession,
  title: 'Start a Posture Session',
  width: applyWidthDifference(375),
  height: applyWidthDifference(590),
}, {
  image: howToGetBestResults,
  title: 'Get the Best Results',
  width: applyWidthDifference(375),
  height: applyWidthDifference(517),
}];

const openHowToVideo = (props) => {
  Mixpanel.track('openHowToVideo');

  const url = 'https://www.youtube.com/embed/Uo27rJAjriw?rel=0&autoplay=0&showinfo=0&controls=0';
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
      throw new Error();
    })
    .catch(() => {
      // This catch handler will handle rejections from Linking.openURL as well
      // as when the user's phone doesn't have any apps to open the URL
      props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Error',
          color: theme.warningColor,
        },
        detail: {
          caption: `${'We could not launch your browser. You can watch the video' +
          'by visiting '}https://youtu.be/Uo27rJAjriw.`,
        },
        buttons: [
          {
            caption: 'OK',
            onPress: () => {
              props.dispatch(appActions.hidePartialModal());
            },
          },
        ],
        backButtonHandler: () => {
          props.dispatch(appActions.hidePartialModal());
        },
      }));
    });
};

const HowTo = (props) => (
  <ScrollView
    removeClippedSubviews={false}
    contentContainerStyle={styles.scrollView}
  >
    <View style={styles.videoLinkContainer}>
      <Button text="Watch Video" onPress={() => openHowToVideo(props)} />
    </View>
    {
      howToContent.map((value, key) => (
        <View
          key={key}
          style={EStyleSheet.child(styles, 'howToContainer', key, howToContent.length)}
        >
          <View style={styles.textContainer}>
            <HeadingText size={2}>{value.title}</HeadingText>
          </View>
          <Image
            source={value.image}
            style={{ width: value.width, height: value.height }}
          />
        </View>
      ))
    }
  </ScrollView>
);

export default connect()(HowTo);
