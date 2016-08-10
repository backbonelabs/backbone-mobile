import React, { Component } from 'react';
import Posture from './Posture';

import {
  View,
} from 'react-native';

class Main extends Component {

  constructor() {
    super();

    this.state = {
      slouch: 0,
    };
  }

  render() {
    return (
      <View>
        <Posture />
      </View>
    );
  }
}

Main.propTypes = {
  navigator: React.PropTypes.object,
  MetaWearAPI: React.PropTypes.object,
};

export default Main;
