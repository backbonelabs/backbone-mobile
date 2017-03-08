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
        createdAt: PropTypes.string,
      }),
    }),
  };

  componentDidMount() {
    this.setSessionTime(sessions[0].durationSeconds);

    const { _id: userId, seenBaselineSurvey, seenAppRating } = this.props.user.user;

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
      Mixpanel.track(baselineSurveyEventName);

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

    if (!seenAppRating) {
      // User has not seen the app rating modal yet.
      // Retrieve user session data to later check if the user has
      // completed 5 full sessions throughout their lifetime.
      this.getUserSessions(userId, new Date(this.props.user.user.createdAt), new Date());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.user.isFetchingSessions && !nextProps.user.isFetchingSessions) {
      // Finished fetching user sessions
      if (!this.props.user.user.seenAppRating) {
        // User has not seen the app rating modal yet.
        // Check if the user completed 5 full sessions throughout their lifetime.
        // A full session is either completing the entire duration of a timed session,
        // or at least one minute of an untimed session.
        let totalFullSessions = 0;
        // Using forEach to allow for early iteration exit once we count 5 full sessions
        forEach(nextProps.user.sessions, session => {
          const { sessionTime, totalDuration } = session;
          if ((sessionTime > 0 && totalDuration === sessionTime) ||
            (sessionTime === 0 && totalDuration >= 60)) {
            // This is a full session, increment counter by 1
            totalFullSessions++;
          }
          if (totalFullSessions === 5) {
            return false;
          }
        });

        if (totalFullSessions === 5) {
          // User completed 5 full sessions, display app rating modal
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
      }
    }
  }

  /**
   * Retrieve user sessions for a date range
   * @param  {String} userId User ID
   * @param  {Date}   from   From date
   * @param  {Date}   to     To Date
   */
  @autobind
  getUserSessions(userId, from, to) {
    this.props.dispatch(userActions.fetchUserSessions({
      from: from.toISOString(),
      to: to.toISOString(),
    }));
  }

  @autobind
  setSessionTime(seconds) {
    this.props.dispatch(postureActions.setSessionTime(seconds));
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
