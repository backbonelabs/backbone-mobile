import React, { Component, PropTypes } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import get from 'lodash/get';
import Carousel from 'react-native-snap-carousel';
import trainingActions from '../actions/training';
import BodyText from '../components/BodyText';
import Card from '../components/Card';
import BG from '../images/dashboard-bg-plain-orange.jpg';
import hexagon from '../images/dashboard/hexagon.png';
import bulletOrangeOn from '../images/bullet-orange-on.png';
import styles from '../styles/dashboard';

const getSessionWorkouts = session => (
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

  constructor(props) {
    super(props);
    autobind(this);

    // TODO: Use better alert
    if (props.training.plans.length === 0) {
      // There are no training plans
      Alert.alert(
        'Alert',
        'Please sign out and sign back in to refresh your account with training plans'
      );
    }

    this.state = {
      animations: this._getAnimations(props.training),
    };
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
          animated: true,
        });
      }
    }, 0);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.training.selectedPlanIdx !== nextProps.training.selectedPlanIdx) {
      this.setState({
        animations: this._getAnimations(nextProps.training),
      });
    }
  }

  _getAnimations(trainingProps) {
    const { plans, selectedPlanIdx } = trainingProps;
    return get(
      plans,
      [selectedPlanIdx, 'levels'],
      []
    ).map(() => new Animated.Value(0.7));
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
    // levelOffset will change after scrolling past the midway point of the bottommost hexagon,
    // and this will trigger the selection of a new level. In other words, a level will be
    // selected once more than half of its hexagon container height is in view.
    const levelOffset = Math.round(hexagonOffsets);
    const newLevel = levels.length - 1 - levelOffset;

    if (newLevel !== selectedLevelIdx) {
      this.props.selectLevel(newLevel);
      const animations = [];

      // Animation for scaling the new selected level's hexagon up
      animations.push(Animated.timing(this.state.animations[newLevel], {
        useNativeDriver: true,
        duration: 300,
        easing: Easing.linear,
        toValue: 1,
      }));

      // Animation for scaling the previously selected level's hexagon down
      animations.push(Animated.timing(this.state.animations[selectedLevelIdx], {
        useNativeDriver: true,
        duration: 300,
        easing: Easing.linear,
        toValue: 0.7,
      }));

      Animated.parallel(animations, {
        stopTogether: false,
      }).start();
    }
  }

  _getLevelIcons() {
    const {
      plans,
      selectedPlanIdx,
    } = this.props.training;
    const levels = get(plans, [selectedPlanIdx, 'levels'], []);

    return levels.map((level, idx) => {
      const connectorStyle = idx === levels.length - 1 ? 'hexagonConnectorTop' : 'hexagonConnector';
      return (
        <View key={idx} style={styles.hexagonContainer}>
          <View style={styles[connectorStyle]} />
          <Animated.Image
            source={hexagon}
            style={[
              styles.hexagon,
              {
                transform: [{
                  scale: this.state.animations[idx],
                }],
              },
            ]}
          >
            <BodyText>{idx + 1}</BodyText>
          </Animated.Image>
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
