import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
import autobind from 'autobind-decorator';
// import SvgUri from 'react-native-svg-uri'; replace when package updates
import BodyText from '../../components/BodyText';
import styles from '../../styles/posture/postureSummary';
import theme from '../../styles/theme';
// import summarySvg from '../../images/session/summaryCircle.svg'; replace when package updates
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

  @autobind
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
    const goodPostureTimeString = goodPostureTimeStringArray.join(' ');

    return (
      <View style={styles.container}>
        <Image source={summaryCircle} style={styles.summaryCircle}>
          <View style={styles.summary}>
            <View style={styles.summaryOuter} />
            <View style={styles.summaryInner}>
              <BodyText style={styles._time}>{goodPostureTimeString}</BodyText>
              <BodyText style={styles._timeBodyText}>of excellent posture</BodyText>
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
