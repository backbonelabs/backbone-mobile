import React, { PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import styles from '../../styles/posture/postureDashboard';
import Icon5Min from '../../images/session/5min.png';
import Icon10Min from '../../images/session/10min.png';
import Icon15Min from '../../images/session/15min.png';
import Icon20Min from '../../images/session/20min.png';
import IconInfinity from '../../images/session/infinity.png';
import DailyStreakBanner from '../../images/session/dailyStreakBanner.png';

const sessions = [
  { id: '5min', icon: Icon5Min },
  { id: '10min', icon: Icon10Min },
  { id: '15min', icon: Icon15Min },
  { id: '20min', icon: Icon20Min },
  { id: 'infinity', icon: IconInfinity },
];

const renderItem = (session) => (
  <View key={session.id}>
    <Image source={session.icon} />
  </View>
);

const PostureDashboard = (props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <HeadingText size={2}>{props.user.nickname}</HeadingText>
      <HeadingText size={2}>Choose your goal</HeadingText>
    </View>
    <View style={styles.body}>
      <View style={styles.carouselContainer}>
        <Carousel
          items={sessions}
          renderItem={renderItem}
          snapOnAndroid
          sliderWidth={styles.$sliderWidth}
          itemWidth={styles.$itemWidth}
          slideStyle={styles.carouselItem}
          inactiveSlideScale={0.8}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <Button
        text="START"
        primary
        style={styles._startButton}
      />
    </View>
    <View style={styles.footer}>
      <BodyText>DAILY STREAK</BodyText>
      <View style={styles.dailyStreakContainer}>
        <Image source={DailyStreakBanner} style={styles.dailyStreakBanner} />
        <BodyText style={styles._streakCounter}>{props.user.dailyStreak || 0}</BodyText>
      </View>
    </View>
  </View>
);

PostureDashboard.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
  user: PropTypes.shape({
    nickname: PropTypes.string,
    dailyStreak: PropTypes.number,
  }),
};

const mapStateToProps = (state) => {
  const { user: { user } } = state;
  return { user };
};

export default connect(mapStateToProps)(PostureDashboard);
