import React, { Component } from 'react';
import Progress from 'react-native-progress';
import TimerMixin from 'react-timer-mixin';

import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginBottom: 35,
    alignItems: 'center',
    flexDirection: 'column',
  },
  slouches: {
    fontSize: 30,
    color: '#f86c41',
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
    marginTop: 55,
    marginBottom: -2,
    width: 255,
    height: 255,
    borderRadius: 255 / 2,
    borderWidth: 15,
    borderColor: 'white',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  progressPie: {
    marginTop: -275,
    marginBottom: 65,
    alignSelf: 'center',
  },
});

class CalibrateView extends Component {
  constructor() {
    super();
    this.state = {
      calibrating: null,
      calibrateCount: 0,
      fadeAnim: new Animated.Value(0),
    };
    this.setTimeout = TimerMixin.setTimeout.bind(this);
    this.calibrating = this.calibrating.bind(this);
    this.convertTotalTime = this.convertTotalTime.bind(this);
  }

  componentDidMount() {
    const context = this;
    let count = 0;

    function cycleAnimation() {
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(
        context.state.fadeAnim,
        { toValue: 1 }),
        Animated.delay(200),
        Animated.timing(
        context.state.fadeAnim,
        { toValue: 0 }),
      ]).start(() => {
        count = context.props.calibrateCount ? 1 : 0;
        if (!count) {
          cycleAnimation();
        }
      });
    }
    this.calibrating();
    cycleAnimation();
  }

  calibrating() {
    if (this.state.calibrateCount < 6 && !this.state.calibrating) {
      this.state.calibrating = TimerMixin.setInterval(() => {
        this.setState({
          calibrateCount: ++this.state.calibrateCount,
        }, () => {
          this.calibrating();
        });
      }, 1250);
    } else if (this.state.calibrating && this.state.calibrateCount >= 6) {
      TimerMixin.clearInterval(this.state.calibrating);
      this.props.startPostureMonitoring();
    }
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
        <Image style={styles.circle} source={require('../images/circle.png')} />
        <Progress.Circle
          style={styles.progressPie}
          color="#48BBEC"
          unfilledColor="#f86c41"
          borderWidth={0}
          showsText
          thickness={20}
          progress={this.state.calibrateCount / 5}
          size={300}
        />
        <Animated.View style={{ opacity: this.state.fadeAnim }}>
          <Text style={styles.slouches}>
            STRAIGHTEN UP
          </Text>
        </Animated.View>
      </View>
    );
  }
}

CalibrateView.propTypes = {
  startPostureMonitoring: React.PropTypes.func,
};

export default CalibrateView;
