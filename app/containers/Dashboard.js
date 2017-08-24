import React, { Component, PropTypes } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import get from 'lodash/get';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import appActions from '../actions/app';
import trainingActions from '../actions/training';
import BodyText from '../components/BodyText';
import Card from '../components/Card';
import Carousel from '../components/Carousel';
import purpleBg from '../images/dashboard/dashboard-bg-purple.jpg';
import blueBg from '../images/dashboard/dashboard-bg-blue.jpg';
import greenBg from '../images/dashboard/dashboard-bg-green.jpg';
import orangeBg from '../images/dashboard/dashboard-bg-orange.jpg';
import redBg from '../images/dashboard/dashboard-bg-red.jpg';
import hexagon from '../images/dashboard/hexagon.png';
import bulletPurpleOn from '../images/bullet-purple-on.png';
import bulletPurpleOff from '../images/bullet-purple-off.png';
import bulletBlueOn from '../images/bullet-blue-on.png';
import bulletBlueOff from '../images/bullet-blue-off.png';
import bulletGreenOn from '../images/bullet-green-on.png';
import bulletGreenOff from '../images/bullet-green-off.png';
import bulletOrangeOn from '../images/bullet-orange-on.png';
import bulletOrangeOff from '../images/bullet-orange-off.png';
import bulletRedOn from '../images/bullet-red-on.png';
import bulletRedOff from '../images/bullet-red-off.png';
import { getColorNameForLevel } from '../utils/levelColors';
import {
  getNextIncompleteSession,
  getNextIncompleteLevel,
} from '../utils/trainingUtils';
import routes from '../routes';
import styles from '../styles/dashboard';

const colorBackgrounds = {
  purple: purpleBg,
  blue: blueBg,
  green: greenBg,
  orange: orangeBg,
  red: redBg,
};

const colorBulletsOn = {
  purple: bulletPurpleOn,
  blue: bulletBlueOn,
  green: bulletGreenOn,
  orange: bulletOrangeOn,
  red: bulletRedOn,
};

const colorBulletsOff = {
  purple: bulletPurpleOff,
  blue: bulletBlueOff,
  green: bulletGreenOff,
  orange: bulletOrangeOff,
  red: bulletRedOff,
};

const getScrollOffset = event => get(event, 'nativeEvent.contentOffset.y', 0);

/**
 * Sets up animation values to be used for each level icon. The animation values are used
 * in the scale function for the transform style applied to the hexagon icons for each level.
 *
 * @param  {Object[]} levels
 * @return {Animated.Value[]}
 */
const getAnimationsForLevels = (levels = []) => levels.map(() => new Animated.Value(0.6));

const getLevelCircles = (level) => {
  const nextSessionIndex = getNextIncompleteSession(level);

  // Check if this level has been completed
  if (nextSessionIndex === -1) {
    return (<FontAwesomeIcon name={'check'} style={styles.hexagonCheckmark} />);
  }

  // Else display the session progress circles
  return level.map((session, sessionIdx) => {
    if (sessionIdx < nextSessionIndex) {
      return (
        <FontAwesomeIcon key={sessionIdx} name={'circle'} style={styles.hexagonCircleCompleted} />
      );
    }
    return (
      <FontAwesomeIcon key={sessionIdx} name={'circle'} style={styles.hexagonCircle} />
    );
  });
};

class Dashboard extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }).isRequired,
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
    user: PropTypes.shape({
      trainingPlanProgress: PropTypes.Object,
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
        toValue: 0.6,
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
    const nextLevelIndex = getNextIncompleteLevel(levels);

    return levels.map((level, idx) => {
      const connectorStyle = idx === levels.length - 1 ? 'hexagonConnectorTop' : 'hexagonConnector';
      const isLevelUnlocked = idx <= nextLevelIndex;

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
            {
              isLevelUnlocked ?
                <View style={styles.hexagonCircleContainer}>
                  {getLevelCircles(level)}
                </View> : <Icon name="lock" style={styles.levelLock} />
            }
          </Animated.Image>
        </View>
      );
    }).reverse();
  }

  /**
   * Fires the action creator for changing the session
   * @param {Number} idx Integer index of the session
   */
  _onSnapToSession(idx) {
    this.props.selectSession(idx);
  }

  _onSelectSession(navTitle) {
    this.props.navigator.push({
      ...routes.guidedTraining,
      title: navTitle,
    });
  }

  /**
   * Returns a Card for displaying the workouts contained in a session
   * @param {Object} session
   * @param {Number} idx     The index of the session within the level
   */
  _getSessionCard(session, idx) {
    const {
      selectedPlanIdx,
      selectedLevelIdx,
      plans,
    } = this.props.training;
    const levels = get(plans, [selectedPlanIdx, 'levels'], []);
    const level = get(levels, selectedLevelIdx, []);
    const nextLevelIndex = getNextIncompleteLevel(levels);
    const isLevelUnlocked = selectedLevelIdx <= nextLevelIndex;
    const nextSessionIndex = getNextIncompleteSession(level);
    const isSessionUnlocked = isLevelUnlocked &&
    (nextSessionIndex === -1 || idx <= nextSessionIndex);
    const navTitle = `Level ${selectedLevelIdx + 1} Session ${idx + 1}`;
    let cardContents;

    if (isSessionUnlocked) {
      cardContents = session.map(workout => {
        const color = getColorNameForLevel(selectedLevelIdx);
        return (
          <View key={workout.title} style={styles.sessionWorkoutRow}>
            <Image
              source={workout.isComplete ? colorBulletsOn[color] : colorBulletsOff[color]}
              style={styles.workoutBullet}
            />
            <BodyText>{workout.title}</BodyText>
          </View>
        );
      });
    } else {
      cardContents = (
        <View style={styles.lockedCard}>
          <Icon name="lock" style={styles.sessionLock} />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={idx}
        onPress={() => isSessionUnlocked && this._onSelectSession(navTitle)}
      >
        <Card>
          {cardContents}
        </Card>
      </TouchableOpacity>
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
              renderItem={this._getSessionCard}
              sliderWidth={styles.$carouselSliderWidth}
              itemWidth={styles.$carouselItemWidth}
              showsHorizontalScrollIndicator={false}
              onSnapToItem={this._onSnapToSession}
              firstItem={selectedSessionIdx}
              slideStyle={styles.sessionCard}
              enableSnap
              enableMomentum
              snapOnAndroid
            />
          }
        </View>
      </Image>
    );
  }
}

const mapStateToProps = ({ training, user: { user } }) => ({
  training,
  user,
});

export default connect(mapStateToProps, {
  ...appActions,
  ...trainingActions,
})(Dashboard);
