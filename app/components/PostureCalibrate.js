import React, { Component } from 'react';
import {
  View,
  Text,
  // Image,
  Animated,
} from 'react-native';
import TimerMixin from 'react-timer-mixin';
import styles from '../styles/postureCalibrate';

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

  render() {
    return (
      <View style={styles.container}>
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
