import React from 'react';
import {
  View,
  Image,
  ScrollView,
} from 'react-native';
import styles from '../styles/howTo';
import HeadingText from '../components/HeadingText';
import section1 from '../images/howTo/section1.png';
import section2 from '../images/howTo/section2.png';
import section3 from '../images/howTo/section3.png';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;
const howToContent = [{
  image: section1,
  title: 'Use Your Backbone',
  width: applyWidthDifference(375),
  height: applyWidthDifference(1464),
}, {
  image: section2,
  title: 'Start a Posture Session',
  width: applyWidthDifference(375),
  height: applyWidthDifference(768),
}, {
  image: section3,
  title: 'Get the Best Results',
  width: applyWidthDifference(375),
  height: applyWidthDifference(755),
}];

const HowTo = () => (
  <ScrollView
    removeClippedSubviews={false}
    contentContainerStyle={styles.scrollView}
  >
    {
      howToContent.map((value, key) => (
        <View key={key} style={styles.howToContainer}>
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
