import React, { Component } from 'react';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
} from 'react-native';
import PostureButton from './PostureButton';
import styles from '../styles/monitor';

export default class MonitorView extends Component {
  static propTypes = {
    currentRoute: React.PropTypes.object,
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

  constructor() {
    super();
    this.convertTotalTime = this.convertTotalTime.bind(this);
  }

  stringFormatTime(seconds) {
    let time = seconds;
    let string = '';

    if (seconds >= 3600) {
      const hours = `${(time - (time % 3600)) / 3600}h`;
      time %= 3600;
      string += hours;
    }

    if (seconds >= 60) {
      const minutes = `${(time - (time % 60)) / 60}m`;
      time %= 60;
      string += minutes;
    }

    string += `${time % 60}s`;
    return string;
  }

  render() {
    const avatarColor = this.props.tilt > 15 ? '#f86c41' : '#48BBEC';
    const direction = this.props.tiltDirection === 'forward' ? 'counter-clockwise' : 'clockwise';
    const tiltStyle = {
      marginTop: -265,
      marginBottom: 130,
      transform: [
        { rotate: (direction === 'clockwise') ?
          `-${this.props.tilt}deg` :
          `${this.props.tilt}deg`,
        },
      ],
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.props.currentRoute.title}</Text>
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
        <Icon name="user" style={tiltStyle} size={120} color={avatarColor} />
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
