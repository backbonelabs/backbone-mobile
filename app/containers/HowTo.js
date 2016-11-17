import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
import gradientBackground20 from '../images/gradientBackground20.png';
import styles from '../styles/support';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';

class HowTo extends Component {
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

  constructor() {
    super();
  }

  render() {
    return (
      <Image source={gradientBackground20} style={styles.background}>
        <View>
          <View style={{ flex: 0.6, height: 300, width: 300 }}/>
          <View style={{ flex: 0.2, alignItems: 'center' }}>
            <HeadingText size={2}>Putting on Backbone</HeadingText>
          </View>
          <View style={{ flex: 0.2, alignItems: 'center' }}>
            <BodyText>Putting on Backbone</BodyText>
          </View>
        </View>
      </Image>
    );
  }
}

export default HowTo;
