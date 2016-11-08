import React, { Component, PropTypes } from 'react';
import {
  View,
  Animated,
  Easing,
} from 'react-native';
import styles from '../.././../styles/posture/postureMonitor';

class Monitor extends Component {
  static propTypes = {
    level: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.spinValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.spin();
  }

  spin() {
    this.spinValue.setValue(0);
    Animated.timing(
      this.spinValue,
      {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
      }
    ).start();
  }

  render() {
    const { level } = this.props;
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${level}deg`],
    });

    return (
      <View style={styles.monitor}>
        <View style={styles.monitorPointer}>
          <Animated.View
            style={[
              {
                transform: [
                    { rotate: spin },
                ],
              },
            ]}
          >
            <View style={styles.point} />
            <View style={styles.hand} />
          </Animated.View>
          <View style={styles.base} />
        </View>
      </View>
    );
  }
}

export default Monitor;

        // <Animated.View
        //   style={[
        //     styles.spinner,
        //     {
        //       transform: [
        //           { rotate: spin },
        //       ],
        //     },
        //   ]}
        // >
          // <View style={styles.monitorPointWrapper}>
          //   <View style={styles.monitorHand} />
          //   <View style={styles.monitorPoint} />
          // </View>
        // </Animated.View>
