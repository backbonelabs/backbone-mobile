import React, { Component } from 'react';

import {
  View,
} from 'react-native';

class Main extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View />
    );
  }
}

Main.propTypes = {
  navigator: React.PropTypes.object,
  MetaWearAPI: React.PropTypes.object,
};

export default Main;
