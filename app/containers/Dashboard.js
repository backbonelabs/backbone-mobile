import React, { Component, PropTypes } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import get from 'lodash/get';
import Carousel from 'react-native-snap-carousel';
import trainingActions from '../actions/training';
import BodyText from '../components/BodyText';
import Card from '../components/Card';
import BG from '../images/dashboard-bg-plain-orange.jpg';
import hexagonSm from '../images/dashboard/hexagon-sm.png';
import hexagonLg from '../images/dashboard/hexagon-lg.png';
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

const getScrollOffset = event => get(event, 'nativeEvent.contentOffset.y', 0);

class Dashboard extends Component {
  static propTypes = {
    selectLevel: PropTypes.func.isRequired,
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
    this._scrollView = null;
  }

  componentDidMount() {
    setTimeout(() => {
      if (this._scrollView) {
        const {
          plans,
          selectedPlanIdx,
          selectedLevelIdx,
        } = this.props.training;
        const levels = get(plans[selectedPlanIdx], 'levels', []);
        let y = 0;
        if (levels.length) {
          y = (levels.length - 1 - selectedLevelIdx) * styles.$hexagonContainerHeight;
        }

        this._scrollView.scrollTo({
          y,
          animated: false,
        });
      }
    }, 0);
  }

  _onScroll(event) {
    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
    } = this.props.training;
    const levels = get(plans[selectedPlanIdx], 'levels', []);
    const hexagonContainerHeight = styles.$hexagonContainerHeight;
    const hexagonOffsets = getScrollOffset(event) / hexagonContainerHeight;
    const levelOffset = Math.round(hexagonOffsets);
    const activeLevel = levels.length - 1 - levelOffset;
    if (activeLevel !== selectedLevelIdx) {
      this.props.selectLevel(levels.length - 1 - levelOffset);
    }
  }

  _getLevelIcons() {
    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
    } = this.props.training;
    const levels = plans[selectedPlanIdx].levels;

    return levels.map((level, idx) => {
      if (idx === selectedLevelIdx) {
        return (
          <View key={idx} style={styles.hexagonContainer}>
            <Image source={hexagonLg} style={styles.hexagonLg}>
              <BodyText>{idx + 1}</BodyText>
            </Image>
          </View>
        );
      }

      const connectorStyle = idx === levels.length - 1 ? 'hexagonConnectorTop' : 'hexagonConnector';
      return (
        <View key={idx} style={styles.hexagonContainer}>
          <View style={styles[connectorStyle]} />
          <Image source={hexagonSm} style={styles.hexagonSm}>
            <BodyText>{idx + 1}</BodyText>
          </Image>
        </View>
      );
    }).reverse();
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
        <View style={styles.levelSliderOuterContainer}>
          <ScrollView
            ref={(scrollView) => { this._scrollView = scrollView; }}
            onScroll={this._onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.levelSliderInnerContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {this._getLevelIcons()}
          </ScrollView>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.carouselContainer}>
          <Card style={styles._mainSessionCard}>
            {getSessionWorkouts(
              get(plans, [selectedPlanIdx, 'levels', selectedLevelIdx, selectedSessionIdx], [])
            )}
          </Card>
        </View>
      </Image>
    );
  }
}

const mapStateToProps = ({ training }) => ({
  training,
});

export default connect(mapStateToProps, trainingActions)(Dashboard);
