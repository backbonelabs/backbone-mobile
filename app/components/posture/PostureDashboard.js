import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Image,
  Linking,
  NativeModules,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import appActions from '../../actions/app';
import userActions from '../../actions/user';
import postureActions from '../../actions/posture';
import HeadingText from '../../components/HeadingText';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import constants from '../../utils/constants';
import SensitiveInfo from '../../utils/SensitiveInfo';
import styles from '../../styles/posture/postureDashboard';
import partialModalStyles from '../../styles/partialModal';
import Icon5Min from '../../images/session/5min.png';
import Icon10Min from '../../images/session/10min.png';
import Icon15Min from '../../images/session/15min.png';
import Icon20Min from '../../images/session/20min.png';
import IconInfinity from '../../images/session/infinity.png';
import DailyStreakBanner from '../../images/session/dailyStreakBanner.png';
import routes from '../../routes';

const { BluetoothService } = NativeModules;

const { bluetoothStates, storageKeys } = constants;

const sessions = [
  { id: '5min', durationSeconds: 5 * 60, icon: Icon5Min },
  { id: '10min', durationSeconds: 10 * 60, icon: Icon10Min },
  { id: '15min', durationSeconds: 15 * 60, icon: Icon15Min },
  { id: '20min', durationSeconds: 20 * 60, icon: Icon20Min },
  { id: 'infinity', durationSeconds: 0, icon: IconInfinity },
];

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
      _id: PropTypes.string,
      nickname: PropTypes.string,
      dailyStreak: PropTypes.number,
      seenBaselineSurvey: PropTypes.bool,
    }),
  };

  componentDidMount() {
    this.setSessionTime(sessions[0].durationSeconds);

    if (this.props.user.seenBaselineSurvey) {
      // If initial survey has been displayed, do nothing
    } else {
      // Else display the initial survey
      // And set the survey state to disable displaying it again for this user
      const userData = {
        seenBaselineSurvey: true,
      };

      this.props.dispatch(userActions.updateUser({
        _id: this.props.user._id,
        ...userData,
      }));

      this.props.dispatch(appActions.showPartialModal({
        content: (
          <View>
            <BodyText style={partialModalStyles._bodyText}>
              Have a minute? Help us improve Backbone by taking this 60-second survey!
            </BodyText>
            <View style={partialModalStyles.buttonView}>
              <Button
                style={partialModalStyles._button}
                text="No, thanks"
                onPress={() => this.props.dispatch(appActions.hidePartialModal())}
              />
              <Button
                style={partialModalStyles._button}
                text="OK, sure"
                primary
                onPress={() => {
                  // const url = `${Environment.WEB_SERVER_URL}`;
                  const url = 'https://backbonelabsinc.typeform.com/to/lVs1Sh';
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
                        'Baseline Survey',
                        'We could not launch your browser. Please take the survey ' + // eslint-disable-line prefer-template, max-len
                        'by visiting ' + url + '.',
                      );
                    });

                  this.props.dispatch(appActions.hidePartialModal());
                }}
              />
            </View>
          </View>
        ),
      }));
    }
  }

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
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeadingText size={2}>{this.props.user.nickname}</HeadingText>
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
              { this.props.user.dailyStreak }
            </BodyText>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { device, user: { user } } = state;
  return { device, user };
};

export default connect(mapStateToProps)(PostureDashboard);
