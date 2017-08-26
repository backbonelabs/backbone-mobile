import React, { PropTypes } from 'react';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryStack,
  VictoryLabel,
} from 'victory-native';
import { View } from 'react-native';
import HeadingText from '../components/HeadingText';
import styles from '../styles/stats';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const renderBars = (data) => (
  Object.keys(data).map((val, idx) => {
    const good = data[val].totalDuration - data[val].slouchTime;
    const poor = data[val].slouchTime;
    const session = idx + 1;
    return (
      <VictoryStack colorScale={['#F44336', '#8BC34A']} key={idx}>
        <VictoryBar
          data={[{ session, time: poor }]}
          x={'session'}
          y={'time'}
        />
        <VictoryBar
          data={[{ session, time: good }]}
          x={'session'}
          y={'time'}
        />
      </VictoryStack>
    );
  })
);

const tickValues = (data) => Object.keys(data).map((val) => val);

const Graph = ({ data, goodTime, poorTime }) => {
  if (!goodTime || !poorTime) {
    return <HeadingText size={1} style={styles._noData}>No Data Available</HeadingText>;
  }
  return (
    <View style={styles.graph}>
      <VictoryChart
        domainPadding={applyWidthDifference(10)}
        width={applyWidthDifference(410)}
        theme={VictoryTheme.material}
      >
        <VictoryLabel
          x={applyWidthDifference(30)}
          y={applyWidthDifference(40)}
          text="Minutes"
        />

        <VictoryAxis
          style={{
            tickLabels: {
              fontSize: fixedResponsiveFontSize(12),
            },
          }}
          tickValues={tickValues(data)}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(x) => Math.round(x / 60)}
        />
        { data ? renderBars(data) : null}
      </VictoryChart>
    </View>
  );
};

Graph.propTypes = {
  data: PropTypes.object,
  goodTime: PropTypes.number,
  poorTime: PropTypes.number,
};

export default Graph;
