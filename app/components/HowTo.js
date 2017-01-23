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

const howToContent = [
  { image: section1, title: 'Use Your Backbone' },
  { image: section2, title: 'Start A Posture Session' },
  { image: section3, title: 'Get The Best Results' },
];

const HowTo = () => (
  <ScrollView>
    {
      howToContent.map((value, key) => (
        <View key={key} style={styles.howToContainer}>
          <View style={styles.textContainer}>
            <HeadingText size={2}>{value.title}</HeadingText>
          </View>
          <Image source={value.image} />
        </View>
      ))
    }
  </ScrollView>
);

export default HowTo;
