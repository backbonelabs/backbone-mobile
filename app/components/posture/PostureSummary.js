import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  TouchableWithoutFeedback,
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

let startCount = 10;

class PostureSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stars: [
        {
          id: 1,
          right: 50,
        },
        {
          id: 2,
          right: 150,
        },
        {
          id: 3,
          right: 300,
        },
        {
          id: 4,
          right: 124,
        },
        {
          id: 5,
          right: 90,
        },
        {
          id: 6,
          right: 225,
        },
        {
          id: 7,
          right: 180,
        },
        {
          id: 8,
          right: 280,
        },
        {
          id: 9,
          right: 25,
        },
        {
          id: 10,
          right: 100,
        },
      ],
    };
    this.addStar = this.addStar.bind(this);
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
      <TouchableWithoutFeedback style={styles.container} onPress={this.addStar}>
        <View style={styles.container}>
          <Image source={summaryCircle} style={styles.summaryCircle}>
            <View style={styles.summary}>
              <Text style={styles.time}>04:30 mins</Text>
              <BodyText style={styles._timeBodyText}>of excellent posture</BodyText>
              <BodyText style={styles._goal}>Goal: 5 mins</BodyText>
            </View>
          </Image>
          <BodyText style={styles._quote}>
              Nice work! Keep it up and you'll be on your way to better posture
          </BodyText>
          { this.dropStars() }
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default PostureSummary;
