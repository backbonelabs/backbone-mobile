import React, { Component } from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
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

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeadingText size={1}>{this.props.user.firstName}</HeadingText>
          <HeadingText size={1}>CHOOSE YOUR GOAL</HeadingText>
        </View>
        <View>
          <ScrollView horizontal>
            {sessions.map((session) => (
              <View key={session.title} style={styles.sessionContainer}>
                <View style={styles.sessionAvatar} />
                <BodyText>{session.title}</BodyText>
                { isFinite(session.duration) ? <BodyText>{session.duration} mins</BodyText> : null }
              </View>
            ))}
          </ScrollView>
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
