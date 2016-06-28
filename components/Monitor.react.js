import React, { Component } from 'react';
import Progress from 'react-native-progress';

import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginBottom: 35,
    alignItems: 'center',
    flexDirection: 'column',
  },
  slouches: {
    fontSize: 120,
    marginTop: -120,
    marginBottom: 80,
    color: '#f86c41',
    fontWeight: '500',
  },
  slouchText: {
    fontSize: 24,
    marginTop: -275,
    marginBottom: 110,
    color: '#9da2a7',
    fontWeight: '500',
  },
  time: {
    fontSize: 28,
    fontFamily: 'Helvetica',
    fontWeight: '400',
  },
  timeContainer: {
    marginTop: -20,
    alignItems: 'center',
  },
  circle: {
    marginTop: -275,
    marginBottom: 65,
    width: 255,
    height: 255,
    borderRadius: 255 / 2,
    borderWidth: 15,
    borderColor: 'white',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  progressPie: {
    marginTop: 35,
    alignSelf: 'center',
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
    return (
      <View style={styles.container}>
        <Progress.Pie
          style={styles.progressPie}
          color="#48BBEC"
          unfilledColor="#f86c41"
          borderWidth={0}
          progress={
            (this.props.postureTime + 0.01) / (this.props.slouchTime + this.props.postureTime + 0.01)
          }
          size={300}
        />
        <Image style={styles.circle} source={require('../images/circle.png')}/>
        <Text style={styles.slouchText}>
          SLOUCH
        </Text>
        <Text style={styles.slouches}>
          { this.props.slouches }
        </Text>
      </View>
    );
  }
}

MonitorView.propTypes = {
  slouches: React.PropTypes.number,
  slouchTime: React.PropTypes.number,
  postureTime: React.PropTypes.number,
};

export default MonitorView;
