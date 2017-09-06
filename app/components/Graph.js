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

const { applyWidthDifference, fixedResponsiveFontSize, width, height } = relativeDimensions;

const renderBars = (data) => (
  data.map((val, idx) => {
    const good = val.totalDuration - val.slouchTime;
    const poor = val.slouchTime;
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

const tickValues = (data) => data.map((val) => val.label);

const Graph = ({ data, goodTime, poorTime }) => {
  if (!goodTime && !poorTime) {
    return <HeadingText size={1} style={styles.noData}>No Data Available</HeadingText>;
  }

  const chartWidth = width + 20;

  return (
    <View>
      <VictoryChart
        domainPadding={applyWidthDifference(10)}
        width={(width <= 320) ? 350 : chartWidth}
        height={height > 480 ? 350 : 280}
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
    </View>
  );
};

Graph.propTypes = {
  data: PropTypes.array,
  goodTime: PropTypes.number,
  poorTime: PropTypes.number,
};

export default Graph;
