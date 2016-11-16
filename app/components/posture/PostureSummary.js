import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
// import SvgUri from 'react-native-svg-uri'; replace when package updates
import BodyText from '../../components/BodyText';
import styles from '../../styles/posture/postureSummary';
// import summarySvg from '../../images/session/summaryCircle.svg'; replace when package updates
import summaryCircle from '../../images/session/summaryCircle.png';
import AnimatedStar from './AnimatedStar';

const getRandomNumber = (min, max) => (
   (Math.random() * (max - min)) + min
);

let startCount = 0;

class PostureSummary extends Component {
  static propTypes = {
    time: PropTypes.string,
    goal: PropTypes.string,
  }
  constructor(props) {
    super(props);

    this.state = {
      stars: [],
      intervalId: '',
    };
    this.addStar = this.addStar.bind(this);
  }

  componentWillMount() {
    const intervalId = setInterval(this.addStar, 800);
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  addStar() {
    startCount += 1;
    this.state.stars.push({
      id: startCount,
      right: getRandomNumber(0, 300),
    });
    this.setState(this.state);
  }

  removeStar(v) {
    const index = this.state.stars.findIndex((star) => star.id === v);
    this.state.stars.splice(index, 1);
    this.setState(this.state);
  }

  dropStars() {
    return this.state.stars.map((star, idx) => (
      <AnimatedStar
        key={star.id}
        style={{ right: this.state.stars[idx].right }}
        onComplete={this.removeStar.bind(this, star.id)} // eslint-disable-line
      />
    ));
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={summaryCircle} style={styles.summaryCircle}>
          <View style={styles.summary}>
            <BodyText style={styles._time}>{this.props.time} mins</BodyText>
            <BodyText style={styles._timeBodyText}>of excellent posture</BodyText>
            <BodyText style={styles._goal}>Goal: {this.props.goal} mins</BodyText>
          </View>
        </Image>
        <BodyText style={styles._quote}>
            Nice work! Keep it up and you'll be on your way to better posture
        </BodyText>
        { this.dropStars() }
      </View>
    );
  }
}

export default PostureSummary;
