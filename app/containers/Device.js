import React, { Component, PropTypes } from 'react';
import {
  Image,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import gradientBackground20 from '../images/gradientBackground20.png';
import sensorSmall from '../images/settings/sensorSmall.png';
import styles from '../styles/device';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';

class Device extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      pop: PropTypes.func,
    }),
    support: PropTypes.shape({
      inProgress: PropTypes.bool,
      errorMessage: PropTypes.string,
    }),
    user: PropTypes.shape({
      nickname: PropTypes.string,
    }),
  };

  render() {
    return (
      <Image source={gradientBackground20} style={styles.backgroundImage}>
        <View style={{ flex: 0.7, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={sensorSmall} />
          <BodyText style={styles._deviceInfoBodyText}>MY BACKBONE</BodyText>
          <SecondaryText style={styles._deviceInfoSecondaryText}>Firmware Version: 0.1</SecondaryText>
          <SecondaryText style={styles._deviceInfoSecondaryText}>Last Updated: Today</SecondaryText>
        </View>
        <View style={{ flex: 0.3, alignItems: 'center' }}>
          <Button text="UNPAIR" primary />
        </View>
      </Image>
    );
  }
}

const mapStateToProps = (state) => {
  const { support, user: { user } } = state;
  return { support, user };
};

export default connect(mapStateToProps)(Device);
