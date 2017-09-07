import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { View, Image, NativeModules } from 'react-native';
import autobind from 'class-autobind';
import Button from '../Button';
import BodyText from '../BodyText';
import postureActions from '../../actions/posture';
import femaleSitting from '../../images/posture/female-sitting.gif';
import routes from '../../routes';
import styles from '../../styles/posture/postureIntro';
import constants from '../../utils/constants';
import Mixpanel from '../../utils/Mixpanel';
import deviceActions from '../../actions/device';
import appActions from '../../actions/app';

const { BluetoothService, DeviceInformationService } = NativeModules;
const { bluetoothStates } = constants;

// The setSessionTime action creator must be dispatched after initial mount/render
// to avoid a setState warning, so a React Component is required
// export class for testing
export class PostureIntroComponent extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    duration: PropTypes.number.isRequired,
    navigator: PropTypes.shape({
      replace: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired,
    postureActions: PropTypes.shape({
      setSessionTime: PropTypes.func.isRequired,
    }),
    app: PropTypes.shape({
      modal: PropTypes.shape({
        showPartial: PropTypes.bool,
      }),
    }),
    device: PropTypes.shape({
      isConnected: PropTypes.bool,
      isConnecting: PropTypes.bool,
      requestingSelfTest: PropTypes.bool,
      inProgress: PropTypes.bool,
      selfTestStatus: PropTypes.bool,
      hasSavedSession: PropTypes.bool,
    }),
  };

  constructor() {
    super();
    autobind(this);
  }

  componentDidMount() {
    // Set posture session duration in Redux store
    this.props.dispatch(postureActions.setSessionTime(this.props.duration));
  }

  start() {
    // First of all, check if Bluetooth is enabled
    BluetoothService.getState((error, { state }) => {
      if (!error) {
        if (state === bluetoothStates.ON) {
          if (!this.props.device.isConnected) {
            if (this.props.device.isConnecting) {
              this.props.dispatch(appActions.showPartialModal({
                title: { caption: 'Error' },
                detail: { caption: 'Connecting to your Backbone. Please try again later.' },
                buttons: [
                  {
                    caption: 'OK',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                    },
                  },
                ],
                backButtonHandler: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              }));
            } else {
              // Check saved device and attempt to connect to one
              // Else, scan for a new device
              this.props.dispatch(appActions.showPartialModal({
                title: { caption: 'Error' },
                detail: { caption: 'Please connect to your Backbone before starting a session.' },
                buttons: [
                  {
                    caption: 'Cancel',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                    },
                  },
                  {
                    caption: 'OK',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                      this.props.navigator.push(routes.deviceScan);
                    },
                  },
                ],
                backButtonHandler: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              }));
            }
          } else if (!this.props.device.selfTestStatus) {
            // Check if self-test is being fixed
            if (this.props.device.requestingSelfTest) {
              // Display an alert stating that the auto-fix is on the way
              this.props.dispatch(appActions.showPartialModal({
                title: { caption: 'Error' },
                detail: { caption: 'Fixing Backbone sensor' },
                buttons: [
                  {
                    caption: 'OK',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                    },
                  },
                ],
                backButtonHandler: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              }));
            } else {
              // Display an alert to let the user choose whether to auto-fix or not
              this.props.dispatch(appActions.showPartialModal({
                title: { caption: 'Error' },
                detail: { caption: 'There is an issue with the Backbone sensor. ' +
                'Would you like to have it try to fix itself now?' },
                buttons: [
                  {
                    caption: 'Cancel',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                    },
                  },
                  {
                    caption: 'OK',
                    onPress: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                      Mixpanel.track('selfTest-begin');
                      DeviceInformationService.requestSelfTest();
                      this.props.dispatch(deviceActions.selfTestRequested());
                    },
                  },
                ],
                backButtonHandler: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              }));
            }
          } else {
            // Self-test passed, proceed to the Calibration scene
            this.props.navigator.replace(routes.postureCalibrate);
          }
        } else {
          this.props.dispatch(appActions.showPartialModal({
            title: { caption: 'Error' },
            detail: { caption: 'Bluetooth is off. Turn on Bluetooth before continuing.' },
            buttons: [
              {
                caption: 'OK',
                onPress: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              },
            ],
            backButtonHandler: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          }));
        }
      } else {
        this.props.dispatch(appActions.showPartialModal({
          title: { caption: 'Error' },
          detail: { caption: 'Bluetooth is off. Turn on Bluetooth before continuing.' },
          buttons: [
            {
              caption: 'OK',
              onPress: () => {
                this.props.dispatch(appActions.hidePartialModal());
              },
            },
          ],
          backButtonHandler: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        }));
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <BodyText style={styles.text}>Sit or stand up straight before you begin</BodyText>
        <Image source={femaleSitting} style={styles.image} />
        <Button text="START" primary onPress={this.start} />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  device: state.device,
});

export default connect(mapStateToProps)(PostureIntroComponent);
