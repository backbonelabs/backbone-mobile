import React from 'react';
import {
  View,
  Image,
  ScrollView,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/howTo';
import HeadingText from '../components/HeadingText';
import howToUseBackbone from '../images/howTo/howToUseBackbone.png';
import howToStartSession from '../images/howTo/howToStartSession.png';
import howToGetBestResults from '../images/howTo/howToGetBestResults.png';
import relativeDimensions from '../utils/relativeDimensions';

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

const HowTo = () => (
  <ScrollView
    removeClippedSubviews={false}
    contentContainerStyle={styles.scrollView}
  >
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

export default HowTo;
