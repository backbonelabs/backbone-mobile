import React, { PropTypes } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryStack } from 'victory-native';
import { View } from 'react-native';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import styles from '../styles/stats';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

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

const Graph = ({ data, selectedTab, goodTime, poorTime }) => {
  if (!goodTime || !poorTime) {
    return <HeadingText size={1}>No Sessions</HeadingText>;
  }
  return (
    <View style={styles.graph}>
      <View style={styles.heading}>
        <HeadingText size={1}>{ selectedTab }</HeadingText>
        <View style={styles.sessionRatingContainer}>
          <BodyText style={styles._goodRating}>{goodTime} MIN</BodyText>
          <BodyText style={styles._poorRating}>{poorTime} MIN</BodyText>
        </View>
      </View>
      <VictoryChart
        domainPadding={applyWidthDifference(10)}
        width={applyWidthDifference(400)}
        theme={VictoryTheme.material}
      >
        <VictoryAxis
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
  selectedTab: PropTypes.string,
  goodTime: PropTypes.number,
  poorTime: PropTypes.number,
};

export default Graph;
