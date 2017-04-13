import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
import autobind from 'class-autobind';
import { compact } from 'lodash';
import BodyText from '../../components/BodyText';
import HeadingText from '../../components/HeadingText';
import styles from '../../styles/posture/postureSummary';
import theme from '../../styles/theme';
import summaryCircle from '../../images/session/summaryCircle.png';
import AnimatedStar from './AnimatedStar';

const getRandomNumber = (min, max) => (
   (Math.random() * (max - min)) + min
);

class PostureSummary extends Component {
  static propTypes = {
    goodPostureTime: PropTypes.number.isRequired,
    goal: PropTypes.number.isRequired,
  }
  constructor() {
    super();
    autobind(this);
    this.state = {
      stars: {},
      intervalId: '',
    };

    this.counter = 0;
  }

  componentWillMount() {
    this.intervalId = setInterval(this.addStar, 800);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  addStar() {
    const stars = { ...this.state.stars };
    stars[++this.counter] = (
      <AnimatedStar
        key={this.counter}
        style={{ right: getRandomNumber(-25, theme.screenWidth - 25) }}
        onComplete={this.removeStar.bind(this, this.counter)} // eslint-disable-line
      />
    );
    this.setState({ stars });
  }

  removeStar(v) {
    const stars = { ...this.state.stars };
    delete stars[v];
    this.setState({ stars });
  }

  render() {
    const { goodPostureTime } = this.props;
    const goodPostureHours = Math.floor(goodPostureTime / 3600);
    const goodPostureMinutes = Math.floor((goodPostureTime - (goodPostureHours * 3600)) / 60);
    const goodPostureSeconds = goodPostureTime % 60;

    const goodPostureTimeStringArray = ['', '', `${goodPostureSeconds} sec`];
    if (goodPostureHours) {
      goodPostureTimeStringArray[0] = `${goodPostureHours} hr`;
    }
    if (goodPostureMinutes) {
      goodPostureTimeStringArray[1] = `${goodPostureMinutes} min`;
    }
    const goodPostureTimeString = compact(goodPostureTimeStringArray).join(' ');

    return (
      <View style={styles.container}>
        <Image source={summaryCircle} style={styles.summaryCircle}>
          <View style={styles.summary}>
            <View style={styles.summaryOuter} />
            <View style={styles.summaryInner}>
              <HeadingText size={2} style={styles._goodPostureTime}>
                {goodPostureTimeString}
              </HeadingText>
              <BodyText style={styles._goodPostureTimeBodyText}>of excellent posture</BodyText>
            </View>
            <View style={styles.summaryOuter}>
              {
                this.props.goal > 0 ?
                  <BodyText style={styles._goal}>Goal: {this.props.goal} mins</BodyText> : null
              }
            </View>
          </View>
        </Image>
        <BodyText style={styles._quote}>
            Nice work! Keep it up and you'll be on your way to better posture.
        </BodyText>
        { Object.values(this.state.stars) }
      </View>
    );
  }
}

export default PostureSummary;
