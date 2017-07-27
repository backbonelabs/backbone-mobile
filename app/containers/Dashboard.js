import React, { Component, PropTypes } from 'react';
import { View, Image } from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import get from 'lodash/get';
import Carousel from 'react-native-snap-carousel';
import BodyText from '../components/BodyText';
import Card from '../components/Card';
import BG from '../images/dashboard-bg-plain-orange.jpg';
import polygonSm from '../images/polygon-sm.png';
import polygonLg from '../images/polygon-lg.png';
import bulletOrangeOn from '../images/bullet-orange-on.png';
import styles from '../styles/dashboard';

const getSessionWorkouts = session => (
  // TODO: If plans is an empty array, add error message telling user
  // to log back in to see plans
  session.map(workout => (
    <View key={workout.title} style={styles.sessionWorkoutRow}>
      <Image source={bulletOrangeOn} style={styles.workoutBullet} />
      <BodyText key={workout.title}>{workout.title}</BodyText>
    </View>
  ))
);

class Dashboard extends Component {
  static propTypes = {
    training: PropTypes.shape({
      plans: PropTypes.array,
      selectedPlanIdx: PropTypes.number,
      selectedLevelIdx: PropTypes.number,
      selectedSessionIdx: PropTypes.number,
    }),
  };

  constructor() {
    super();
    autobind(this);
    this.state = {};
  }

  getLevelIcons() {
    const {
      plans,
      selectedPlanIdx,
    } = this.props.training;
    const levels = plans[selectedPlanIdx].levels;

    return levels.map((level, idx) => (
      <Image key={idx} source={polygonLg} style={styles.polygon}>
        <BodyText>{idx + 1}</BodyText>
      </Image>
    )).reverse();
  }

  render() {
    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
    } = this.props.training;

    return (
      <Image source={BG} style={styles.backgroundImage}>
        <View style={styles.levelSliderContainer}>
          <Carousel
            sliderHeight={300}
            itemHeight={100}
            inactiveSlideScale={0.7}
            firstItem={plans[selectedPlanIdx].levels.length - 1 - selectedLevelIdx}
            snapOnAndroid
            vertical
            onSnapToItem={index => console.log('oh snap', index)}
          >
            {this.getLevelIcons()}
          </Carousel>
        </View>
        <Card style={styles._mainSessionCard}>
          {getSessionWorkouts(
            get(plans, [selectedPlanIdx, 'levels', selectedLevelIdx, selectedSessionIdx], [])
          )}
        </Card>
      </Image>
    );
  }
}

const mapStateToProps = ({ training }) => ({
  training,
});

export default connect(mapStateToProps)(Dashboard);
