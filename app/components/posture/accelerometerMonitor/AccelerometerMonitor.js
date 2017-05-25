import React, { Component } from 'react';
import {
  Alert,
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryLabel,
} from 'victory-native';
import autobind from 'class-autobind';
import MonitorButton from '../postureMonitor/MonitorButton';
import Button from '../../../components/Button';
import styles from '../../../styles/posture/accelerometerMonitor';
import relativeDimensions from '../../../utils/relativeDimensions';

const { PropTypes } = React;

const { AccelerometerService } = NativeModules;
const AccelerometerServiceEvents = new NativeEventEmitter(AccelerometerService);

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default class AccelerometerMonitor extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      xValues: [],
      yValues: [],
      zValues: [],
      currentIndex: 0,
      hasPendingOperation: false,
      isStreaming: false,
    };
  }

  componentWillMount() {
    AccelerometerService.reset();

    this.accelerometerDataListener =
      AccelerometerServiceEvents.addListener('AccelerometerData', this.accelerometerDataHandler);
  }

  componentWillUnmount() {
    const { hasPendingOperation, isStreaming } = this.state;

    this.accelerometerDataListener.remove();
    if (!hasPendingOperation && isStreaming) {
      AccelerometerService.stopListening(() => {
      });
    }

    AccelerometerService.reset();
  }

  accelerometerDataHandler(event) {
    const { currentIndex, xValues, yValues, zValues } = this.state;
    const { xAxis, yAxis, zAxis } = event;

    xValues.push({ index: currentIndex, value: xAxis });
    yValues.push({ index: currentIndex, value: yAxis });
    zValues.push({ index: currentIndex, value: zAxis });

    if (xValues.length > 50) {
      xValues.shift();
    }

    if (yValues.length > 50) {
      yValues.shift();
    }

    if (zValues.length > 50) {
      zValues.shift();
    }

    this.setState({
      currentIndex: currentIndex + 1,
      xValues: this.state.xValues,
      yValues: this.state.yValues,
      zValues: this.state.zValues,
    });
  }

  toggleAccelerometer() {
    const { isStreaming, hasPendingOperation } = this.state;

    if (hasPendingOperation) return;

    this.setState({ hasPendingOperation: true });

    if (!isStreaming) {
      AccelerometerService.startListening(error => {
        if (!error) {
          this.setState({ isStreaming: true });
        }

        this.setState({ hasPendingOperation: false });
      });
    } else {
      AccelerometerService.stopListening(error => {
        if (!error) {
          this.setState({ isStreaming: false });
        }

        this.setState({ hasPendingOperation: false });
      });
    }
  }

  resetMonitor() {
    AccelerometerService.stopListening(() => {
      this.setState({
        xValues: [],
        yValues: [],
        zValues: [],
        currentIndex: 0,
        hasPendingOperation: false,
        isStreaming: false,
      });

      Alert.alert('Log', 'Do you want to export the log for the this session?',
        [
          {
            text: 'Yes',
            onPress: () => {
              AccelerometerService.exportLog();
            },
          },
          {
            text: 'No',
            onPress: () => {
              AccelerometerService.reset();
            },
          },
        ]
      );
    });
  }

  render() {
    const {
      xValues,
      yValues,
      zValues,
      isStreaming,
      currentIndex,
    } = this.state;

    const headIndex = (currentIndex >= 50 ? currentIndex - 50 : 0);
    const tailIndex = headIndex + 50;

    const xDomain = [headIndex, tailIndex];
    const yDomain = [-2, 2];

    const getControlButton = () => {
      if (!isStreaming) {
        return <MonitorButton start onPress={this.toggleAccelerometer} hideCaption />;
      }

      return <MonitorButton stop onPress={this.toggleAccelerometer} hideCaption />;
    };

    // Used as placeholder in the line chart to prevent warnings
    // as VictoryChart doesn't allow less than 2 records of data
    const emptyData = [
      { index: 0, value: 0 },
      { index: 0, value: 0 },
    ];

    const xRecords = (xValues.length < 2 ? emptyData : xValues);
    const yRecords = (yValues.length < 2 ? emptyData : yValues);
    const zRecords = (zValues.length < 2 ? emptyData : zValues);

    return (
      <View style={styles.container}>
        <View>
          <VictoryChart domain={{ x: xDomain, y: yDomain }}>
            <VictoryAxis
              style={{
                tickLabels: { fill: 'none' },
              }}
            />
            <VictoryLabel
              text="X-axis"
              dy={1}
              style={{ stroke: 'red', fontSize: fixedResponsiveFontSize(14) }}
            />
            <VictoryLabel
              text="Y-axis"
              dx={applyWidthDifference(150)}
              dy={1}
              style={{ stroke: 'blue', fontSize: fixedResponsiveFontSize(14) }}
            />
            <VictoryLabel
              text="Z-axis"
              dx={applyWidthDifference(300)}
              dy={1}
              style={{ stroke: 'green', fontSize: fixedResponsiveFontSize(14) }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                grid: { stroke: '#212121', strokeDasharray: '10, 10' },
                tickLabels: { fontSize: fixedResponsiveFontSize(12) },
              }}
            />
            <VictoryLine
              data={xRecords}
              style={{
                data: { stroke: 'red', strokeWidth: 2 },
                labels: { fontSize: fixedResponsiveFontSize(12) },
              }}
              x="index"
              y="value"
            />
            <VictoryLine
              data={yRecords}
              style={{
                data: { stroke: 'blue', strokeWidth: 2 },
                labels: { fontSize: fixedResponsiveFontSize(12) },
              }}
              x="index"
              y="value"
            />
            <VictoryLine
              data={zRecords}
              style={{
                data: { stroke: 'green', strokeWidth: 2 },
                labels: { fontSize: fixedResponsiveFontSize(12) },
              }}
              x="index"
              y="value"
            />
          </VictoryChart>
        </View>
        <View>
          {getControlButton()}
        </View>
        <View>
          <Button
            primary text="Reset"
            onPress={this.resetMonitor}
          />
        </View>
      </View>
    );
  }
}
