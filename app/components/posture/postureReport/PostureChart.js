import React, { PropTypes } from 'react';
import { View } from 'react-native';
import { VictoryPie } from 'victory-native';
import moment from 'moment';
import styles from '../../../styles/posture/postureChart';
import HeadingText from '../../../components/HeadingText';
import color from '../../../styles/theme';
import BodyText from '../../BodyText';

const PostureChart = (props) => {
  const { sessionDate: { totalDuration, slouchTime, timestamp } } = props;
  const data = {};
  data.date = moment(timestamp).format('MMMM D, YYYY');
  data.chartData = [
    {
      label: 'Good',
      duration: totalDuration - slouchTime,
    },
    {
      label: 'Poor',
      duration: slouchTime,
    },
  ];

  data.total = moment().startOf('day').seconds(totalDuration).format('H:mm:ss');
  data.good = moment().startOf('day').seconds(totalDuration - slouchTime).format('H:mm:ss');
  data.bad = moment().startOf('day').seconds(slouchTime).format('H:mm:ss');

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <HeadingText size={2}>{data.date}</HeadingText>
      </View>
      <View style={styles.chart}>
        <VictoryPie
          style={{
            labels: { fontSize: 14, fontWeight: 'bold' },
          }}
          innerRadius={80}
          data={data.chartData}
          x="label"
          y="duration"
          width={350}
          padding={{ top: 80, bottom: 0, left: 70, right: 70 }}
          colorScale={[
            'white',
            color.primaryColor,
          ]}
        />
        <View style={styles._total}>
          <HeadingText size={1}>Total</HeadingText>
          <HeadingText size={1}>{data.total}</HeadingText>
        </View>
      </View>
      <View style={styles._statsContainer}>
        <View style={styles.innerContainer}>
          <BodyText style={styles._statsGoodHeader}>Good</BodyText>
          <BodyText style={styles._statsText}>{data.good}</BodyText>
        </View>
        <View style={styles.innerContainer}>
          <BodyText style={styles._statsBadHeader}>Bad</BodyText>
          <BodyText style={styles._statsText}>{data.bad}</BodyText>
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
