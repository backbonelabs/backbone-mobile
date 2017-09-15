import {
  Platform,
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import styles from '../styles/expansion';
import constants from '../utils/constants';

const { expansionLoaderStates } = constants;

class Expansion extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
    }),
    app: PropTypes.shape({
      nextRoute: PropTypes.object,
    }),
  }

  constructor(props) {
    super(props);
    autobind(this);

    this.state = {
      currentState: expansionLoaderStates.CHECKING,
      message: 'Unable to download additional resources',
      progressPercentage: 0,
    };
  }

  componentWillMount() {
    if (Platform.OS === 'android') {
      const ExpansionServiceEvents = new NativeEventEmitter(NativeModules.ExpansionService);

      this.expansionLoaderStateListener = ExpansionServiceEvents.addListener(
        'ExpansionLoaderState',
        ({ state, message }) => {
          this.setState({ currentState: state, message });

          if (state === expansionLoaderStates.COMPLETED) {
            // Expansion files fully loaded, proceed to the pending initial scene.
            // Set a short timer to allow the success message to be displayed a little longer
            setTimeout(() => {
              this.props.navigator.replace(this.props.app.nextRoute);
            }, 1500);
          }
        });

      this.expansionDownloadProgressListener = ExpansionServiceEvents.addListener(
        'ExpansionDownloadProgress',
        ({ percentage }) => {
          this.setState({ progressPercentage: percentage });
        });
    }
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      NativeModules.ExpansionService.loadExpansionFile();
    }
  }

  componentWillUnmount() {
    if (this.expansionLoaderStateListener) {
      this.expansionLoaderStateListener.remove();
    }
    if (this.expansionDownloadProgressListener) {
      this.expansionDownloadProgressListener.remove();
    }
  }

  retry() {
    if (Platform.OS === 'android') {
      NativeModules.ExpansionService.loadExpansionFile();
    }
  }

  render() {
    const { currentState, message, progressPercentage } = this.state;
    let description;

    if (currentState === expansionLoaderStates.CHECKING) {
      description = 'Checking for additional resources';
    } else if (currentState === expansionLoaderStates.DOWNLOADING) {
      description = 'Downloading additional resources';
    } else if (currentState === expansionLoaderStates.UNZIPPING) {
      description = 'Unpacking additional resources';
    } else if (currentState === expansionLoaderStates.COMPLETED) {
      description = 'Additional resources loaded';
    } else if (currentState === expansionLoaderStates.ERROR) {
      description = message;
    }

    return (
      <View style={styles.container}>
        {
        currentState !== expansionLoaderStates.ERROR &&
          <Spinner size="large" style={styles.spinner} />
        }
        <BodyText style={styles.expansionState}>
          {description}
        </BodyText>
        {
          currentState === expansionLoaderStates.DOWNLOADING &&
            <SecondaryText style={styles.expansionProgress}>
              {progressPercentage}% Completed
            </SecondaryText>
        }
        {
          currentState === expansionLoaderStates.ERROR &&
          <View style={styles.buttonContainer}>
            <Button
              text="Retry"
              onPress={this.retry}
              primary
            />
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { app } = state;
  return { app };
};

export default connect(mapStateToProps)(Expansion);
