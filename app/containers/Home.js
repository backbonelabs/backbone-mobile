import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import routes from '../routes';
import styles from '../styles/home';

const { PropTypes } = React;
const sessions = [
  { title: 'Beginner', duration: 5 },
  { title: 'Intermediate', duration: 10 },
  { title: 'Pro', duration: 15 },
  { title: 'Master', duration: 20 },
  { title: 'Invincible', duration: Infinity },
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
      <View key={session.title} style={styles.sessionContainer}>
        <View style={styles.sessionIcon} />
        <BodyText>{session.title}</BodyText>
        { isFinite(session.duration) ? <BodyText>{session.duration} mins</BodyText> : null }
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
        <View>
          <Carousel
            items={sessions}
            renderItem={this.renderItem}
            snapOnAndroid
            sliderWidth={styles.$sliderWidth}
            itemWidth={styles.$carouselItemWidth}
            slideStyle={styles.carousel}
            inactiveSlideScale={0.8}
            contentContainerCustomStyle={styles.carouselItemContainer}
          />
        </View>
        <View>
          <Button onPress={() => this.props.navigator.push(routes.postureDashboard)} text="Start" />
        </View>
        <View style={styles.footer}>
          <View style={styles.streakCounter}><BodyText>100</BodyText></View>
          <BodyText>Daily Streak</BodyText>
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
