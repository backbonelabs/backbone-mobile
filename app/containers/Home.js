import React, { Component } from 'react';
import {
  View,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import routes from '../routes';
import styles from '../styles/home';
import Icon5Min from '../images/session/5min.png';
import Icon10Min from '../images/session/10min.png';
import Icon15Min from '../images/session/15min.png';
import Icon20Min from '../images/session/20min.png';
import IconUnlimited from '../images/session/unlimited.png';
import DailyStreakBanner from '../images/session/dailyStreakBanner.png';

const { PropTypes } = React;
const sessions = [
  { id: '5min', icon: Icon5Min },
  { id: '10min', icon: Icon10Min },
  { id: '15min', icon: Icon15Min },
  { id: '20min', icon: Icon20Min },
  { id: 'unlimited', icon: IconUnlimited },
];

class Home extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
    user: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {};
  }

  renderItem(session) {
    return (
      <View key={session.id}>
        <Image source={session.icon} />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeadingText size={2}>{this.props.user.firstName}</HeadingText>
          <HeadingText size={2}>Choose your goal</HeadingText>
        </View>
        <View style={styles.body}>
          <View style={styles.carouselContainer}>
            <Carousel
              items={sessions}
              renderItem={this.renderItem}
              snapOnAndroid
              sliderWidth={styles.$sliderWidth}
              itemWidth={styles.$itemWidth}
              slideStyle={styles.carouselItem}
              inactiveSlideScale={0.8}
            />
          </View>
          <Button
            text="START"
            primary
            style={styles._startButton}
            onPress={() => this.props.navigator.push(routes.postureDashboard)}
          />
        </View>
        <View style={styles.footer}>
          <BodyText>DAILY STREAK</BodyText>
          <View style={styles.dailyStreakContainer}>
            <Image source={DailyStreakBanner} style={styles.dailyStreakBanner} />
            <BodyText style={styles._streakCounter}>{this.props.user.dailyStreak || 0}</BodyText>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return { user: user.user };
};

export default connect(mapStateToProps)(Home);
