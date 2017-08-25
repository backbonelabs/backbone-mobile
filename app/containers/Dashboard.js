import React, { Component, PropTypes } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Image,
  ScrollView,
  Platform,
  View,
  InteractionManager,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import moment from 'moment';
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import Icon from 'react-native-vector-icons/MaterialIcons';
import appActions from '../actions/app';
import userActions from '../actions/user';
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
import SensitiveInfo from '../utils/SensitiveInfo';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import { getColorNameForLevel } from '../utils/levelColors';
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

const { storageKeys, surveyThresholds, surveyUrls, appUrls } = constants;
const isiOS = Platform.OS === 'ios';

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
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }).isRequired,
    selectLevel: PropTypes.func.isRequired,
    selectSession: PropTypes.func.isRequired,
    showPartialModal: PropTypes.func.isRequired,
    hidePartialModal: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    fetchUserSessions: PropTypes.func.isRequired,
    training: PropTypes.shape({
      plans: PropTypes.array,
      selectedPlanIdx: PropTypes.number,
      selectedLevelIdx: PropTypes.number,
      selectedSessionIdx: PropTypes.number,
    }),
    device: PropTypes.shape({
      // isConnected: PropTypes.bool,
      // isConnecting: PropTypes.bool,
      // requestingSelfTest: PropTypes.bool,
      // inProgress: PropTypes.bool,
      // selfTestStatus: PropTypes.bool,
      hasSavedSession: PropTypes.bool,
    }),
    user: PropTypes.shape({
      isFetchingSessions: PropTypes.bool,
      user: PropTypes.shape({
        _id: PropTypes.string,
        dailyStreak: PropTypes.number,
        seenBaselineSurvey: PropTypes.bool,
        seenAppRating: PropTypes.bool,
        seenFeedbackSurvey: PropTypes.bool,
        createdAt: PropTypes.string,
        lastSession: PropTypes.string,
        trainingPlanProgress: PropTypes.Object,
      }),
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
          <Icon name="error-outline" size={styles.$modalIconSize} style={styles.errorIcon} />
        ),
        detail: {
          caption: 'Please sign out and sign back in to refresh your account with training plans',
        },
        buttons: [{
          caption: 'OK',
          onPress: this.props.hidePartialModal,
        }],
      });
    } else {
      InteractionManager.runAfterInteractions(() => {
        const { hasSavedSession } = this.props.device;

        const {
          _id: userId, seenBaselineSurvey, seenAppRating, seenFeedbackSurvey, lastSession,
        } = this.props.user.user;

        // Prioritize loading previous session if exists
        if (!hasSavedSession && !seenBaselineSurvey) {
          // User has not seen the baseline survey modal yet. Display survey modal
          // and mark as seen in the user profile to prevent it from being shown again.
          const markSurveySeenAndHideModal = () => {
            this.props.updateUser({
              _id: userId,
              seenBaselineSurvey: true,
            });

            this.props.hidePartialModal();
          };

          const baselineSurveyEventName = 'baselineUserSurvey';

          this.props.showPartialModal({
            topView: (
              <Icon name="rate-review" size={styles.$modalIconSize} style={styles.infoIcon} />
            ),
            detail: {
              caption: 'Have a minute? Help us improve Backbone by taking this 60-second survey!',
            },
            buttons: [
              {
                caption: 'No, thanks',
                onPress: () => {
                  Mixpanel.track(`${baselineSurveyEventName}-decline`);
                  markSurveySeenAndHideModal();
                },
              },
              {
                caption: 'OK, sure',
                onPress: () => {
                  const url = `${surveyUrls.baseline}?user_id=${userId}`;
                  Linking.canOpenURL(url)
                    .then(supported => {
                      if (supported) {
                        return Linking.openURL(url);
                      }
                      throw new Error();
                    })
                    .catch(() => {
                      // This catch handler will handle rejections from Linking.openURL
                      // as well as when the user's phone doesn't have any apps
                      // to open the URL
                      Alert.alert(
                        'Error',
                        'We could not launch your browser to access the survey. ' + // eslint-disable-line prefer-template, max-len
                        'Please contact us to fill out the survey.',
                      );
                    });

                  Mixpanel.track(`${baselineSurveyEventName}-accept`);

                  markSurveySeenAndHideModal();
                },
              },
            ],
            backButtonHandler: () => {
              Mixpanel.track(`${baselineSurveyEventName}-decline`);
              markSurveySeenAndHideModal();
            },
          });
        }

        // Calculate and check if 7 days have passed since registration.
        const createdDate = new Date(this.props.user.user.createdAt);
        const timeThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days converted to milliseconds
        const today = new Date();
        if (!seenFeedbackSurvey && (today.getTime() - createdDate.getTime() >= timeThreshold)) {
          // Feedback Survey hasn't been displayed yet, and 7 days have passed.
          // Fetch the user session data to check if the user has
          // completed at least 3 full sessions in the first 7 days after signing up.
          const limitDate = new Date(createdDate.getTime() + timeThreshold);
          this.getUserSessions(userId, createdDate, limitDate);
        } else if (!seenAppRating) {
          // User has not seen the app rating modal yet.
          // Retrieve user session data to later check if the user has
          // completed 5 full sessions throughout their lifetime.
          this.getUserSessions(userId, createdDate, today);
        }

        // Reset daily streak if lastSession was 2 days ago
        const todayDate = moment().format('YYYY-MM-DD');
        const twoDaysLaterDate = moment(lastSession).add(2, 'days').format('YYYY-MM-DD');

        // if the current date is the same as the date 2 days after the last session, reset it
        if (todayDate >= twoDaysLaterDate) {
          this.props.updateUser({
            _id: userId,
            dailyStreak: 0,
          });
        }
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

    const { isFetchingSessions } = this.props.user;
    const sessionsFetched = isFetchingSessions && !nextProps.user.isFetchingSessions;

    if (!nextProps.device.hasSavedSession && sessionsFetched) {
      // Finished fetching user sessions and display popUp when needed
      if (!this.props.user.user.seenFeedbackSurvey || !this.props.user.user.seenAppRating) {
        const createdDate = new Date(this.props.user.user.createdAt);
        const timeThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days converted to milliseconds
        const today = new Date();
        const hasPassedTimeThreshold = today.getTime() - createdDate.getTime() >= timeThreshold;

        // Get the current threshold, as it would increase dynamically if the user choose
        // to skip it for now
        let appRatingSessionThreshold; // in sessions
        SensitiveInfo.getItem(storageKeys.APP_RATING_THRESHOLD)
          .then(threshold => {
            if (threshold) {
              appRatingSessionThreshold = threshold;
            } else {
              appRatingSessionThreshold = surveyThresholds.initialAppRating;
            }

            const feedbackSurveySessionThreshold = surveyThresholds.feedbackSurvey; // in sessions
            const maxThreshold = Math.max(appRatingSessionThreshold,
              feedbackSurveySessionThreshold);
            let totalFullSessions = 0;

            // A full session is either completing the entire duration of a timed session,
            // or at least one minute of an untimed session.
            // Using forEach to allow for early iteration exit once we reach the required count
            forEach(nextProps.user.sessions, session => {
              const { sessionTime, totalDuration } = session;
              if ((sessionTime > 0 && totalDuration === sessionTime) ||
                (sessionTime === 0 && totalDuration >= 60)) {
                // This is a full session, increment counter by 1
                totalFullSessions++;
              }
              if (totalFullSessions === maxThreshold) {
                // We met the maximum possible threshold, exit iteration early
                return false;
              }
            });

            if (!this.props.user.user.seenAppRating &&
              totalFullSessions === appRatingSessionThreshold) {
              this.showAppRatingModal();
            } else if (!this.props.user.user.seenFeedbackSurvey && hasPassedTimeThreshold) {
              // Users should only see this popup at most once,
              // so we mark it as done when the 7-days period has passed
              // if he has completed the required number of sessions,
              // otherwise we display the modal popup
              if (totalFullSessions < feedbackSurveySessionThreshold) {
                this.showFeedbackSurveyModal();
              } else {
                this.props.updateUser({
                  _id: this.props.user.user._id,
                  seenFeedbackSurvey: true,
                });
              }
            }
          });
      }
    }
  }

  /**
   * Retrieve user sessions for a date range
   * @param  {String} userId   User ID
   * @param  {Date}   fromDate Starting date
   * @param  {Date}   toDate   Ending date
   */
  getUserSessions(userId, fromDate, toDate) {
    this.props.fetchUserSessions({
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });
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
    const { selectedLevelIdx } = this.props.training;
    const navTitle = `Level ${selectedLevelIdx + 1} Session ${idx + 1}`;
    const sessionWorkouts = session.map(workout => {
      const color = getColorNameForLevel(this.props.training.selectedLevelIdx);
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

    return (
      <TouchableOpacity
        key={idx}
        onPress={() => this._onSelectSession(navTitle)}
      >
        <Card>
          {sessionWorkouts}
        </Card>
      </TouchableOpacity>
    );
  }

  showAppRatingModal() {
    const appRatingEventName = 'appRating';
    const { _id: userId } = this.props.user.user;

    const markAppRatingSeenAndHideModal = () => {
      this.props.updateUser({
        _id: userId,
        seenAppRating: true,
      });

      this.props.hidePartialModal();
    };

    const postponeAppRatingAndHideModal = () => {
      let nextThreshold;
      SensitiveInfo.getItem(storageKeys.APP_RATING_THRESHOLD)
        .then(threshold => {
          const { initialAppRating, additionalAppRating } = surveyThresholds;
          if (threshold) {
            nextThreshold = threshold + additionalAppRating;
          } else {
            nextThreshold = initialAppRating + additionalAppRating;
          }

          SensitiveInfo.setItem(storageKeys.APP_RATING_THRESHOLD, nextThreshold);
        });

      this.props.hidePartialModal();
    };

    this.props.showPartialModal({
      topView: (
        <Icon name="rate-review" size={styles.$modalIconSize} style={styles.infoIcon} />
      ),
      detail: {
        caption: 'We hope you are enjoying Backbone. Would you mind telling ' + // eslint-disable-line prefer-template, max-len
        `us about your experience in the ${isiOS ? 'App' : 'Play'} Store?`,
      },
      buttons: [
        {
          caption: 'Maybe later',
          onPress: () => {
            Mixpanel.track(`${appRatingEventName}-postpone`);
            postponeAppRatingAndHideModal();
          },
        },
        {
          caption: 'No, thanks',
          onPress: () => {
            Mixpanel.track(`${appRatingEventName}-decline`);
            markAppRatingSeenAndHideModal();
          },
        },
        {
          caption: 'OK, sure',
          onPress: () => {
            const url = isiOS ? appUrls.ios : appUrls.android;
            Linking.canOpenURL(url)
              .then(supported => {
                if (supported) {
                  return Linking.openURL(url);
                }
                throw new Error();
              })
              .catch(() => {
                // This catch handler will handle rejections from Linking.openURL
                // as well as when the user's phone doesn't have any apps
                // to open the URL
                Alert.alert(
                  'Error',
                  'We could not launch the ' + (isiOS ? 'App' : 'Play') + ' Store. ' + // eslint-disable-line prefer-template, max-len
                  'You can still share your feedback with us by filling out the ' +
                  'support form in Settings.'
                );
              });

            Mixpanel.track(`${appRatingEventName}-accept`);

            markAppRatingSeenAndHideModal();
          },
        },
      ],
      backButtonHandler: () => {
        Mixpanel.track(`${appRatingEventName}-decline`);
        markAppRatingSeenAndHideModal();
      },
    });
  }

  showFeedbackSurveyModal() {
    const feedbackSurveyEventName = 'feedbackSurvey';
    const { _id: userId } = this.props.user.user;

    const markFeedbackSurveySeenAndHideModal = () => {
      this.props.updateUser({
        _id: userId,
        seenFeedbackSurvey: true,
      });

      this.props.hidePartialModal();
    };

    this.props.showPartialModal({
      topView: (
        <Icon name="rate-review" size={styles.$modalIconSize} style={styles.infoIcon} />
      ),
      detail: {
        caption: 'Is Backbone working for you?\n' + // eslint-disable-line prefer-template, max-len
        "If you're having a problem or have any other feedback, please let us know!",
      },
      buttons: [
        {
          caption: 'No, thanks',
          onPress: () => {
            Mixpanel.track(`${feedbackSurveyEventName}-decline`);
            markFeedbackSurveySeenAndHideModal();
          },
        },
        {
          caption: 'OK, sure',
          onPress: () => {
            const url = `${surveyUrls.feedback}?user_id=${userId}`;
            Linking.canOpenURL(url)
              .then(supported => {
                if (supported) {
                  return Linking.openURL(url);
                }
                throw new Error();
              })
              .catch(() => {
                // This catch handler will handle rejections from Linking.openURL
                // as well as when the user's phone doesn't have any apps
                // to open the URL
                Alert.alert(
                  'Error',
                  'We could not launch your browser to access the survey. ' + // eslint-disable-line prefer-template, max-len
                  'Please contact us to fill out the survey.',
                );
              });

            Mixpanel.track(`${feedbackSurveyEventName}-accept`);

            markFeedbackSurveySeenAndHideModal();
          },
        },
      ],
      backButtonHandler: () => {
        Mixpanel.track(`${feedbackSurveyEventName}-decline`);
        markFeedbackSurveySeenAndHideModal();
      },
    });
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

const mapStateToProps = ({ user, device, training }) => ({
  user,
  device,
  training,
});

export default connect(mapStateToProps, {
  ...appActions,
  ...userActions,
  ...trainingActions,
})(Dashboard);
