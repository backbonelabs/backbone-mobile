import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Image,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import postureActions from '../../actions/posture';
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
import routes from '../../routes';

const sessions = [
  { id: '5min', durationSeconds: 5 * 60, icon: Icon5Min },
  { id: '10min', durationSeconds: 10 * 60, icon: Icon10Min },
  { id: '15min', durationSeconds: 15 * 60, icon: Icon15Min },
  { id: '20min', durationSeconds: 20 * 60, icon: Icon20Min },
  { id: 'infinity', durationSeconds: 0, icon: IconInfinity },
];

const renderItem = (session) => (
  <View key={session.id}>
    <Image source={session.icon} style={styles.sessionIcon} />
  </View>
);

class PostureDashboard extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
    device: PropTypes.shape({
      isConnected: PropTypes.bool,
    }),
    user: PropTypes.shape({
      nickname: PropTypes.string,
      dailyStreak: PropTypes.number,
    }),
  };

  componentDidMount() {
    this.setSessionTime(sessions[0].durationSeconds);
  }

  setSessionTime(seconds) {
    this.props.dispatch(postureActions.setSessionTime(seconds));
  }

  @autobind
  start() {
    if (!this.props.device.isConnected) {
      return Alert.alert(
        'Error',
        'Please connect to your Backbone before starting a session.',
        [
          {
            text: 'Cancel',
          },
          {
            text: 'Connect',
            onPress: () => this.props.navigator.push(routes.deviceAdd),
          },
        ]
      );
    }

    return this.props.navigator.push(routes.postureCalibrate);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeadingText size={2}>{this.props.user.nickname}</HeadingText>
          <HeadingText size={2}>Choose your goal</HeadingText>
        </View>
        <View style={styles.body}>
          <View style={styles.carouselContainer}>
            <Carousel
              items={sessions}
              renderItem={renderItem}
              snapOnAndroid
              sliderWidth={styles.$sliderWidth}
              itemWidth={styles.$sessionIconContainerWidth}
              slideStyle={styles.carouselItem}
              inactiveSlideScale={0.8}
              showsHorizontalScrollIndicator={false}
              onSnapToItem={(index) => this.setSessionTime(sessions[index].durationSeconds)}
            />
          </View>
          <Button
            text="START"
            primary
            onPress={this.start}
          />
          <View style={styles.dailyStreakContainer}>
            <BodyText style={styles._dailyStreakTitle}>DAILY STREAK</BodyText>
            <Image source={DailyStreakBanner} style={styles.dailyStreakBanner} />
            <BodyText style={styles._streakCounter}>
              { this.props.user.dailyStreak }
            </BodyText>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { device, user: { user } } = state;
  return { device, user };
};

export default connect(mapStateToProps)(PostureDashboard);
