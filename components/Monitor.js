import React, { Component } from 'react';
import * as Progress from 'react-native-progress';
import PostureButton from './PostureButton';

import {
  View,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: 75,
    alignItems: 'center',
    flexDirection: 'column',
  },
  progressCircle: {
    marginTop: 50,
    marginBottom: 50,
  },
});

class MonitorView extends Component {
  constructor() {
    super();

    this.convertTotalTime = this.convertTotalTime.bind(this);
  }

  convertTotalTime(seconds) {
    let timeString = '';

    if (seconds > 60) {
      timeString = `${(seconds - (seconds % 60)) / 60}m ${seconds % 60}s`;
    } else if (seconds > 3600) {
      timeString = `${(seconds - (seconds % 360)) / 360}h ${(seconds - (seconds % 60)) / 60}m ${seconds % 60}s`;
    } else {
      timeString = `0h 0m ${seconds}s`;
    }
    return timeString;
  }

  render() {
    const direction = this.props.tiltDirection === 'forward' ? 'counter-clockwise' : 'clockwise';
    return (
      <View style={styles.container}>
        <Progress.Circle
          size={300}
          thickness={30}
          borderWidth={0}
          progress={((360 - this.props.tilt) / 360)}
          color={'#48BBEC'}
          unfilledColor={'#f86c41'}
          style={styles.progressCircle}
          direction={direction}
        />
        {this.props.monitoring ?
          <PostureButton
            iconName={'pause'}
            buttonText={'STOP'}
            colorStyle={{ backgroundColor: '#f86c41' }}
            onPress={this.props.stop}
          /> :
          <PostureButton
            colorStyle={{ backgroundColor: '#48BBEC' }}
            onPress={this.props.start}
            buttonText={'START'}
          />
        }
      </View>
    );
  }
}

MonitorView.propTypes = {
  tilt: React.PropTypes.number,
  tiltDirection: React.PropTypes.string,
  start: React.PropTypes.func,
  stop: React.PropTypes.func,
  beginCalibrate: React.PropTypes.func,
  monitoring: React.PropTypes.bool,
  slouches: React.PropTypes.number,
  slouchTime: React.PropTypes.number,
  postureTime: React.PropTypes.number,
};

export default MonitorView;
