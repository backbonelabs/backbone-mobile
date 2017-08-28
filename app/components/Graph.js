import React, { PropTypes } from 'react';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryStack,
  VictoryLabel,
} from 'victory-native';
import { ScrollView } from 'react-native';
import HeadingText from '../components/HeadingText';
import styles from '../styles/stats';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize, width } = relativeDimensions;

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
  const tickLength = Object.keys(data).length;
  let chartWidth = 410;
  let chartHeight = 350;
  let scrollEnabled = false;

  if (tickLength > 9) {
    chartWidth = 500;
    scrollEnabled = true;
  }
  // eg: iphone4/iphone5
  if (width === 320) {
    chartHeight = 320;
  }

  if (!goodTime || !poorTime) {
    return <HeadingText size={1} style={styles._noData}>No Data Available</HeadingText>;
  }

  return (
    <ScrollView
      horizontal
      scrollEnabled={scrollEnabled}
    >
      <VictoryChart
        domainPadding={applyWidthDifference(10)}
        width={applyWidthDifference(chartWidth)}
        height={applyWidthDifference(chartHeight)}
        theme={VictoryTheme.material}
      >
        <VictoryLabel
          x={applyWidthDifference(30)}
          y={applyWidthDifference(30)}
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
    </ScrollView>
  );
};

Graph.propTypes = {
  data: PropTypes.object,
  goodTime: PropTypes.number,
  poorTime: PropTypes.number,
};

export default Graph;
