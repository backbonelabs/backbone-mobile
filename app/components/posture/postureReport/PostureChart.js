import React, { PropTypes } from 'react';
import { View } from 'react-native';
import { VictoryPie } from 'victory-native';
import moment from 'moment';
import styles from '../../../styles/posture/postureChart';
import HeadingText from '../../../components/HeadingText';
import color from '../../../styles/theme';
import BodyText from '../../BodyText';
import relativeDimensions from '../../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const PostureChart = (props) => {
  const { sessionDate: { totalDuration, slouchTime, timestamp } } = props;
  const data = {};
  data.date = moment(timestamp).format('MMMM D, YYYY');
  data.chartData = [
    {
      text: 'Good',
      duration: totalDuration - slouchTime,
    },
    {
      text: 'Poor',
      duration: slouchTime,
    },
  ];

  data.total = moment().startOf('day').seconds(totalDuration).format('H:mm:ss');
  data.good = moment().startOf('day').seconds(totalDuration - slouchTime).format('H:mm:ss');
  data.poor = moment().startOf('day').seconds(slouchTime).format('H:mm:ss');

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <HeadingText size={2}>{data.date}</HeadingText>
      </View>
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <VictoryPie
            style={{ labels: styles._chartLabel }}
            innerRadius={applyWidthDifference(80)}
            data={data.chartData}
            x="label"
            y="duration"
            width={applyWidthDifference(350)}
            height={applyWidthDifference(350)}
            padding={applyWidthDifference(70)}
            labels={(datum) => (datum.duration ? datum.text : null)}
            colorScale={['#4CAF50', color.primaryColor]}
          />
        </View>
        <View style={styles.total}>
          <HeadingText size={1}>Total</HeadingText>
          <HeadingText size={1}>{data.total}</HeadingText>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.innerContainer}>
          <BodyText style={styles.statsGoodHeader}>Good</BodyText>
          <BodyText style={styles.statsText}>{data.good}</BodyText>
        </View>
        <View style={styles.innerContainer}>
          <BodyText style={styles.statsPoorHeader}>Poor</BodyText>
          <BodyText style={styles.statsText}>{data.poor}</BodyText>
        </View>
      </View>
    </View>
  );
};

PostureChart.propTypes = {
  dispatch: PropTypes.func,
  sessionDate: PropTypes.object,
};

export default PostureChart;
