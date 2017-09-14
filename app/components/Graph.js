import React, { PropTypes } from 'react';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryStack,
  VictoryLabel,
} from 'victory-native';
import { View, ScrollView } from 'react-native';
import HeadingText from '../components/HeadingText';
import styles from '../styles/stats';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
  width,
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

const tickXValues = (data) => data.map((val) => val.label || val);

/**
 * Renders a Bar Graph
 * @param {Object} session data
 * @param {Number} graph width
 * @param {Bool}   returns true if there is no current data, ex: Today Tab - last 7 hours
 */
const victoryGraph = (data, graphWidth, noCurrentData) => (
  <View style={styles.victoryGraph}>
    <VictoryChart
      domainPadding={applyWidthDifference(20)}
      width={graphWidth}
      height={height > 480 ? 350 : 280}
      theme={VictoryTheme.material}
    >
      <VictoryLabel
        x={applyWidthDifference(30)}
        y={applyWidthDifference(30)}
        text="Minute"
      />

      <VictoryAxis
        style={{
          tickLabels: {
            fontSize: fixedResponsiveFontSize(12),
          },
        }}
        tickValues={tickXValues(data)}
      />
      <VictoryAxis
        dependentAxis
        tickValues={noCurrentData ? [0, 1] : null}
        tickFormat={(x) => {
          if (x < 60) {
            return `${x}s`;
          }
          return Math.ceil(x / 60);
        }}
      />
      { data ? renderBars(data) : null}
    </VictoryChart>
  </View>
);

/**
 * Renders a Bar Graph with a horizontal scrollbar
 * @param {Object} session data
 * @param {Number} graph width
 * @param {Bool}   returns true if there is no current data, ex: Today Tab - last 7 hours
 */
const scrollGraph = (data, graphWidth, noCurrentData) => (
  <ScrollView horizontal>
    {victoryGraph(data, graphWidth, noCurrentData)}
  </ScrollView>
);

const Graph = ({ data, goodTime, poorTime, noCurrentData, selectedTab }) => {
  if ((!goodTime && !poorTime)) {
    return (<View style={styles.noData}>
      <HeadingText size={1}>No Data Available</HeadingText>
    </View>);
  }

  let graphWidth = 1400;

  // adjust width for year tab
  if (selectedTab === 'Year') {
    graphWidth = 500;
  }

  let renderGraph = scrollGraph(data, graphWidth, noCurrentData);

  // Both weeks and month only show 7 ticks in the x axis
  // There we disabled scrolling and adjust width
  if (data.length === 7) {
    if (width <= 320) {
      graphWidth = 350;
    } else {
      graphWidth = width + 20;
    }
    renderGraph = victoryGraph(data, graphWidth, noCurrentData);
  }

  return renderGraph;
};

Graph.propTypes = {
  data: PropTypes.array,
  goodTime: PropTypes.number,
  poorTime: PropTypes.number,
  noCurrentData: PropTypes.bool,
  selectedTab: PropTypes.string,
};

export default Graph;
