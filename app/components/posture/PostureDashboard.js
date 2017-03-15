import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Image,
  Linking,
  NativeModules,
  Platform,
} from 'react-native';
import autobind from 'autobind-decorator';
import moment from 'moment';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import forEach from 'lodash/forEach';
import appActions from '../../actions/app';
import userActions from '../../actions/user';
import postureActions from '../../actions/posture';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import constants from '../../utils/constants';
import SensitiveInfo from '../../utils/SensitiveInfo';
import styles from '../../styles/posture/postureDashboard';
import Icon5Min from '../../images/session/5min.png';
import Icon10Min from '../../images/session/10min.png';
import Icon15Min from '../../images/session/15min.png';
import Icon20Min from '../../images/session/20min.png';
import IconInfinity from '../../images/session/infinity.png';
import DailyStreakBanner from '../../images/session/dailyStreakBanner.png';
import routes from '../../routes';
import Mixpanel from '../../utils/Mixpanel';

const { BluetoothService } = NativeModules;

const { bluetoothStates, storageKeys, surveyUrls, appUrls } = constants;

const sessions = [
  { id: '5min', durationSeconds: 5 * 60, icon: Icon5Min },
  { id: '10min', durationSeconds: 10 * 60, icon: Icon10Min },
  { id: '15min', durationSeconds: 15 * 60, icon: Icon15Min },
  { id: '20min', durationSeconds: 20 * 60, icon: Icon20Min },
  { id: 'infinity', durationSeconds: 0, icon: IconInfinity },
];

const isiOS = Platform.OS === 'ios';

const renderItem = (session) => (
  <View key={session.id}>
    <Image source={session.icon} style={styles.sessionIcon} />
  </View>
);

class PostureDashboard extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
    device: PropTypes.shape({
      isConnected: PropTypes.bool,
      isConnecting: PropTypes.bool,
    }),
    user: PropTypes.shape({
      isFetchingSessions: PropTypes.bool,
      user: PropTypes.shape({
        _id: PropTypes.string,
        nickname: PropTypes.string,
        dailyStreak: PropTypes.number,
        seenBaselineSurvey: PropTypes.bool,
        seenAppRating: PropTypes.bool,
        seenFeedbackSurvey: PropTypes.bool,
        createdAt: PropTypes.string,
        lastSession: PropTypes.string,
      }),
    }),
  };

  componentDidMount() {
    this.setSessionTime(sessions[0].durationSeconds);

    const {
      _id: userId, seenBaselineSurvey, seenAppRating, seenFeedbackSurvey, lastSession,
    } = this.props.user.user;

    if (!seenBaselineSurvey) {
      // User has not seen the baseline survey modal yet. Display survey modal
      // and mark as seen in the user profile to prevent it from being shown again.
      const markSurveySeenAndHideModal = () => {
        this.props.dispatch(userActions.updateUser({
          _id: userId,
          seenBaselineSurvey: true,
        }));

        this.props.dispatch(appActions.hidePartialModal());
      };

      const baselineSurveyEventName = 'baselineUserSurvey';

      this.props.dispatch(appActions.showPartialModal({
        content: (
          <View>
            <BodyText style={styles._partialModalBodyText}>
              Have a minute? Help us improve Backbone by taking this 60-second survey!
            </BodyText>
            <View style={styles.partialModalButtonView}>
              <Button
                style={styles._partialModalButton}
                text="No, thanks"
                onPress={() => {
                  Mixpanel.track(`${baselineSurveyEventName}-decline`);
                  markSurveySeenAndHideModal();
                }}
              />
              <Button
                style={styles._partialModalButton}
                text="OK, sure"
                primary
                onPress={() => {
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
                }}
              />
            </View>
          </View>
        ),
        onClose: () => {
          Mixpanel.track(`${baselineSurveyEventName}-decline`);
          this.props.dispatch(userActions.updateUser({
            _id: userId,
            seenBaselineSurvey: true,
          }));
        },
      }));
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
    if (todayDate === twoDaysLaterDate) {
      this.props.dispatch(userActions.updateUser({
        _id: userId,
        dailyStreak: 0,
      }));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.user.isFetchingSessions && !nextProps.user.isFetchingSessions) {
      // Finished fetching user sessions.
      if (!this.props.user.user.seenFeedbackSurvey || !this.props.user.user.seenAppRating) {
        const createdDate = new Date(this.props.user.user.createdAt);
        const timeThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days converted to milliseconds
        const today = new Date();
        const hasPassedTimeThreshold = today.getTime() - createdDate.getTime() >= timeThreshold;

        const appRatingSessionThreshold = 5;
        const feedbackSurveySessionThreshold = 3;
        const maxThreshold = Math.max(appRatingSessionThreshold, feedbackSurveySessionThreshold);
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
            this.props.dispatch(userActions.updateUser({
              _id: this.props.user.user._id,
              seenFeedbackSurvey: true,
            }));
          }
        }
      }
    }
  }

  /**
   * Retrieve user sessions for a date range
   * @param  {String} userId   User ID
   * @param  {Date}   fromDate Starting date
   * @param  {Date}   toDate   Ending date
   */
  @autobind
  getUserSessions(userId, fromDate, toDate) {
    this.props.dispatch(userActions.fetchUserSessions({
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    }));
  }

  @autobind
  setSessionTime(seconds) {
    this.props.dispatch(postureActions.setSessionTime(seconds));
  }

  @autobind
  showAppRatingModal() {
    const appRatingEventName = 'appRating';
    const { _id: userId } = this.props.user.user;

    const markAppRatingSeenAndHideModal = () => {
      this.props.dispatch(userActions.updateUser({
        _id: userId,
        seenAppRating: true,
      }));

      this.props.dispatch(appActions.hidePartialModal());
    };

    this.props.dispatch(appActions.showPartialModal({
      content: (
        <View>
          <BodyText style={styles._partialModalBodyText}>
            We hope you are enjoying Backbone. Would you mind telling
            us about your experience in the {isiOS ? 'App' : 'Play'} Store?
          </BodyText>
          <View style={styles.partialModalButtonView}>
            <Button
              style={styles._partialModalButton}
              text="No, thanks"
              onPress={() => {
                Mixpanel.track(`${appRatingEventName}-decline`);
                markAppRatingSeenAndHideModal();
              }}
            />
            <Button
              style={styles._partialModalButton}
              text="OK, sure"
              primary
              onPress={() => {
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
              }}
            />
          </View>
        </View>
      ),
      onClose: () => {
        Mixpanel.track(`${appRatingEventName}-decline`);
        this.props.dispatch(userActions.updateUser({
          _id: userId,
          seenAppRating: true,
        }));
      },
    }));
  }

  @autobind
  showFeedbackSurveyModal() {
    const feedbackSurveyEventName = 'feedbackSurvey';
    const { _id: userId } = this.props.user.user;

    const markFeedbackSurveySeenAndHideModal = () => {
      this.props.dispatch(userActions.updateUser({
        _id: userId,
        seenFeedbackSurvey: true,
      }));

      this.props.dispatch(appActions.hidePartialModal());
    };

    this.props.dispatch(appActions.showPartialModal({
      content: (
        <View>
          <BodyText style={styles._partialModalBodyText}>
            Is Backbone working for you?
            If you're having a problem or have any other feedback,
            please let us know!
          </BodyText>
          <View style={styles.partialModalButtonView}>
            <Button
              style={styles._partialModalButton}
              text="No, thanks"
              onPress={() => {
                Mixpanel.track(`${feedbackSurveyEventName}-decline`);
                markFeedbackSurveySeenAndHideModal();
              }}
            />
            <Button
              style={styles._partialModalButton}
              text="OK, sure"
              primary
              onPress={() => {
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
              }}
            />
          </View>
        </View>
      ),
      onClose: () => {
        Mixpanel.track(`${feedbackSurveyEventName}-decline`);
        this.props.dispatch(userActions.updateUser({
          _id: userId,
          seenFeedbackSurvey: true,
        }));
      },
    }));
  }

  @autobind
  start() {
    // First of all, check if Bluetooth is enabled
    BluetoothService.getState((error, { state }) => {
      if (!error) {
        if (state === bluetoothStates.ON) {
          if (!this.props.device.isConnected) {
            if (this.props.device.isConnecting) {
              Alert.alert('Error', 'Connecting to your Backbone. Please try again later.');
            } else {
              // Check saved device and attempt to connect to one
              // Else, scan for a new device
              Alert.alert(
                'Error',
                'Please connect to your Backbone before starting a session.',
                [
                  {
                    text: 'Cancel',
                  },
                  {
                    text: 'Connect',
                    onPress: () => {
                      SensitiveInfo.getItem(storageKeys.DEVICE)
                        .then(device => {
                          if (device) {
                            this.props.navigator.push(routes.deviceConnect);
                          } else {
                            this.props.navigator.push(routes.deviceAdd);
                          }
                        });
                    },
                  },
                ]
              );
            }
          } else {
            this.props.navigator.push(routes.postureCalibrate);
          }
        } else {
          Alert.alert('Error', 'Bluetooth is off. Turn on Bluetooth before continuing.');
        }
      } else {
        Alert.alert('Error', 'Bluetooth is off. Turn on Bluetooth before continuing.');
      }
    });
  }

  render() {
    const { user } = this.props.user;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeadingText size={2}>{user.nickname}</HeadingText>
          <HeadingText size={2}>Choose your goal</HeadingText>
        </View>
        <View style={styles.body}>
          <View style={styles.carouselContainer}>
            <Carousel
              items={sessions}
              renderItem={renderItem}
              snapOnAndroid
              sliderWidth={styles.$sliderWidth}
              itemWidth={styles.$sessionIconContainerWidth}
              slideStyle={styles.carouselItem}
              inactiveSlideScale={0.8}
              showsHorizontalScrollIndicator={false}
              onSnapToItem={(index) => this.setSessionTime(sessions[index].durationSeconds)}
            />
          </View>
          <Button
            text="START"
            primary
            onPress={this.start}
          />
          <View style={styles.dailyStreakContainer}>
            <BodyText style={styles._dailyStreakTitle}>DAILY STREAK</BodyText>
            <Image source={DailyStreakBanner} style={styles.dailyStreakBanner} />
            <BodyText style={styles._streakCounter}>
              { user.dailyStreak }
            </BodyText>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { device, user } = state;
  return { device, user };
};

export default connect(mapStateToProps)(PostureDashboard);
