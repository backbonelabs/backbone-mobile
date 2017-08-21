import React, { Component, PropTypes } from 'react';
import {
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import appActions from '../actions/app';
import trainingActions from '../actions/training';
import BodyText from '../components/BodyText';
import Card from '../components/Card';
import purpleBg from '../images/dashboard/dashboard-bg-purple.jpg';
import blueBg from '../images/dashboard/dashboard-bg-blue.jpg';
import greenBg from '../images/dashboard/dashboard-bg-green.jpg';
import orangeBg from '../images/dashboard/dashboard-bg-orange.jpg';
import redBg from '../images/dashboard/dashboard-bg-red.jpg';
import hexagon from '../images/dashboard/hexagon.png';
import bulletPurpleOn from '../images/bullet-purple-on.png';
// import bulletPurpleOff from '../images/bullet-purple-off.png';
import bulletBlueOn from '../images/bullet-blue-on.png';
// import bulletBlueOff from '../images/bullet-blue-off.png';
import bulletGreenOn from '../images/bullet-green-on.png';
// import bulletGreenOff from '../images/bullet-green-off.png';
import bulletOrangeOn from '../images/bullet-orange-on.png';
// import bulletOrangeOff from '../images/bullet-orange-off.png';
import bulletRedOn from '../images/bullet-red-on.png';
// import bulletRedOff from '../images/bullet-red-off.png';
import { getColorNameForLevel } from '../utils/levelColors';
import styles from '../styles/dashboard';

const colorBackgrounds = {
  purple: purpleBg,
  blue: blueBg,
  green: greenBg,
  orange: orangeBg,
  red: redBg,
};

const colorBullets = {
  purple: bulletPurpleOn,
  blue: bulletBlueOn,
  green: bulletGreenOn,
  orange: bulletOrangeOn,
  red: bulletRedOn,
};

const getScrollOffset = event => get(event, 'nativeEvent.contentOffset.y', 0);

/**
 * Sets up animation values to be used for each level icon. The animation values are used
 * in the scale function for the transform style applied to the hexagon icons for each level.
 *
 * @param  {Object[]} levels
 * @return {Animated.Value[]}
 */
const getAnimationsForLevels = (levels = []) => levels.map(() => new Animated.Value(0.7));

class Dashboard extends Component {
  static propTypes = {
    selectLevel: PropTypes.func.isRequired,
    selectSession: PropTypes.func.isRequired,
    showPartialModal: PropTypes.func.isRequired,
    hidePartialModal: PropTypes.func.isRequired,
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
    const {
      plans,
      selectedPlanIdx,
    } = props.training;
    this.state = {
      animations: getAnimationsForLevels(get(plans, [selectedPlanIdx, 'levels'], [])),
    };
    this._scrollView = null;
  }

  componentDidMount() {
    if (this.props.training.plans.length === 0) {
      // There are no training plans
      this.props.showPartialModal({
        topView: (
          <Icon name="error-outline" size={styles.$errorIconSize} style={styles.errorIcon} />
        ),
        detail: {
          caption: 'Please sign out and sign back in to refresh your account with training plans',
        },
        buttons: [{
          caption: 'OK',
          onPress: this.props.hidePartialModal,
        }],
      });
    }

    setTimeout(() => {
      // Automatically scroll to the next incomplete level when the component mounts
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
      // A different training plan got selected. Set up new animations for each level.
      const { plans, selectedPlanIdx } = nextProps.training;
      this.setState({
        animations: getAnimationsForLevels(get(plans, [selectedPlanIdx, 'levels'], [])),
      });
    }
  }

  /**
   * Handler for the scroll event triggered by the level SrollView. When a new level gets
   * scrolled to, trigger animations to enlarge the hexagon icon of the new level and to
   * shrink the icon of the previous level.
   *
   * @param {Object} event
   */
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

  /**
   * Returns the hexagon icons for each level, as well as the line separator between each icon
   *
   * @param  {Object[]} levels
   * @return {Component[]}
   */
  _getLevelIcons(levels = []) {
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

  /**
   * Fires the action creator for changing the session
   * @param {Number} idx Integer index of the session
   */
  _onSelectSession(idx) {
    this.props.selectSession(idx);
  }

  /**
   * Returns a Card for displaying the workouts contained in a session
   * @param {Object} session
   * @param {Number} idx     The index of the session within the level
   */
  _getSessionCards(session, idx) {
    const sessionWorkouts = session.map(workout => (
      <View key={workout.title} style={styles.sessionWorkoutRow}>
        {/* TODO: Use the "on" and "off" bullets depending if the workout is completed */}
        <Image
          source={colorBullets[getColorNameForLevel(this.props.training.selectedLevelIdx)]}
          style={styles.workoutBullet}
        />
        <BodyText key={workout.title}>{workout.title}</BodyText>
      </View>
    ));

    return (
      <Card key={idx}>
        {sessionWorkouts}
      </Card>
    );
  }

  render() {
    const {
      plans,
      selectedPlanIdx,
      selectedLevelIdx,
      selectedSessionIdx,
    } = this.props.training;
    const sessions = get(plans, [selectedPlanIdx, 'levels', selectedLevelIdx], []);

    return (
      <Image
        source={colorBackgrounds[getColorNameForLevel(selectedLevelIdx)]}
        style={styles.backgroundImage}
      >
        <View style={styles.levelSliderOuterContainer}>
          <ScrollView
            ref={(scrollView) => { this._scrollView = scrollView; }}
            onScroll={this._onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.levelSliderInnerContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {this._getLevelIcons(get(plans, [selectedPlanIdx, 'levels'], []))}
          </ScrollView>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.carouselContainer}>
          {!!sessions.length &&
            <Carousel
              items={sessions}
              renderItem={this._getSessionCards}
              sliderWidth={styles.$carouselSliderWidth}
              itemWidth={styles.$carouselItemWidth}
              showsHorizontalScrollIndicator={false}
              onSnapToItem={this._onSelectSession}
              firstItem={selectedSessionIdx}
              slideStyle={styles.sessionCard}
              enableSnap
              snapOnAndroid
            />
          }
        </View>
      </Image>
    );
  }
}

const mapStateToProps = ({ training }) => ({
  training,
});

export default connect(mapStateToProps, {
  ...appActions,
  ...trainingActions,
})(Dashboard);
