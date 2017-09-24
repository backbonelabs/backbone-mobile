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
import theme from '../styles/theme';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
  height,
} = relativeDimensions;

/**
 * Renders individual Bars for graph
 * @param {Object} session data
 */
const renderBars = (data) => (
  data.map((val, idx) => {
    const good = val.totalDuration - val.slouchTime;
    const poor = val.slouchTime;
    const session = idx + 1;
    const width = data.length <= 7 ? 15 : 4;

    return (
      <VictoryStack
        colorScale={[theme.primaryColor, theme.infoColor]} key={idx}
      >
        <VictoryBar
          data={[{ session, time: poor / 60, width }]}
          x={'session'}
          y={'time'}
        />
        <VictoryBar
          data={[{ session, time: good / 60, width }]}
          x={'session'}
          y={'time'}
        />
      </VictoryStack>
    );
  })
);

const Graph = ({ data, noCurrentSessions, xAxisLabel, xAxisTickValues, yAxisTickValues }) => {
  if (noCurrentSessions) {
    return (<View style={styles.noData}>
      <HeadingText size={1}>No Data Available</HeadingText>
    </View>);
  }

  return (
    <View style={styles.victoryGraph}>
      <VictoryChart
        domainPadding={applyWidthDifference(30)}
        width={applyWidthDifference(420)}
        height={height > 480 ? 350 : 260}
        theme={VictoryTheme.material}
      >
        <VictoryLabel
          x={applyWidthDifference(350)}
          y={applyWidthDifference(30)}
          text="Minutes"
        />

        <VictoryAxis
          style={{
            axisLabel: {
              fontWeight: 'bold',
              padding: applyWidthDifference(40),
            },
            tickLabels: {
              fontSize: fixedResponsiveFontSize(12),
            },
          }}
          fixLabelOverlap
          label={xAxisLabel}
          tickValues={xAxisTickValues}
        />
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: {
              padding: applyWidthDifference(5),
            },
          }}
          orientation="right"
          tickValues={yAxisTickValues}
        />
        { data ? renderBars(data) : null}
      </VictoryChart>
    </View>
  );
};

Graph.propTypes = {
  data: PropTypes.array,
  yAxisTickValues: PropTypes.array,
  xAxisTickValues: PropTypes.array,
  noCurrentSessions: PropTypes.bool,
  xAxisLabel: PropTypes.string,
};

export default Graph;
