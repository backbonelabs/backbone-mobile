import React, { Component, PropTypes } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import BodyText from '../components/BodyText';

class GuidedTraining extends Component {
  static propTypes = {
    workouts: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      instructions: PropTypes.string,
      workout: PropTypes.object,
      isComplete: PropTypes.bool,
    })).isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <View>
        <BodyText>Total workouts: {this.props.workouts.length}</BodyText>
      </View>
    );
  }
}

export default connect()(GuidedTraining);
