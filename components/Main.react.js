import React, { Component } from 'react';

import {
  View,
  Text,
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
        <Text>
          Main
        </Text>
      </View>
    );
  }
}

Main.propTypes = {
  navigator: React.PropTypes.object,
  MetaWearAPI: React.PropTypes.object,
};

export default Main;
