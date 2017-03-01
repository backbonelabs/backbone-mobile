import React, { Component, PropTypes } from 'react';
import {
  View,
  InteractionManager,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import autobind from 'autobind-decorator';
import { VictoryPie } from 'victory-native';
import { connect } from 'react-redux';
import styles from '../../../styles/posture/postureReport';
import HeadingText from '../../../components/HeadingText';
import color from '../../../styles/theme';
import userActions from '../../../actions/user';
import BodyText from '../../BodyText';
import Spinner from '../../Spinner';
import convertToHMS from '../../utils/convertToHMS';
import getDaysAgo from '../../utils/getDaysAgo';

class PostureReport extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    sessions: PropTypes.array,
    loading: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
      sessionIndex: 0,
      from_date: getDaysAgo(7),
      to_date: getDaysAgo(0),
      days: 7,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(userActions.fetchUserSessions({
        from_date: this.state.from_date,
        to_date: this.state.to_date,
      }));
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sessions !== nextProps.sessions) {
      this.setState({ sessions: nextProps.sessions[this.state.sessionIndex] });
    }
  }

  @autobind
  onBackPress() {
    const sessionLength = this.props.sessions.length;

    // if there is no session, don't do anything
    if (!this.state.sessions) {
      return null;
    }

    // if the index is the last one in the sessions array
    if ((this.state.sessionIndex + 1) === sessionLength) {
      // fetch the sessions within 7 days before
      this.props.dispatch(userActions.fetchUserSessions({
        from_date: getDaysAgo(this.state.days + 7),
        to_date: getDaysAgo(this.state.days),
      }));
      this.setState({
        sessionIndex: this.state.sessionIndex + 1,
        days: this.state.days + 7,
      });
    } else {
      this.setState({
        sessionIndex: this.state.sessionIndex + 1,
        sessions: this.props.sessions[this.state.sessionIndex + 1],
      });
    }
  }

  @autobind
  onForwardPress() {
    this.setState({
      sessionIndex: this.state.sessionIndex - 1,
      sessions: this.props.sessions[this.state.sessionIndex - 1],
    });
  }

  render() {
    const { sessions, sessionIndex } = this.state;
    // only show the right arrow if there is a more recent session
    const rightArrow = (sessionIndex === 0) ? <View style={styles.icons} /> :
      <TouchableOpacity
        onPress={this.onForwardPress}
      >
        <View>
          <Icon
            name="angle-right"
            size={40} color="#900"
            style={styles.icons}
          />
        </View>
      </TouchableOpacity>;

    const data = {
      date: 'No sessions',
      chartData: [{ label: null }],
    };

    if (sessions) {
      const { totalDuration, slouchTime, timestamp } = sessions;
      data.date = new Date(timestamp).toDateString();
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
      data.total = convertToHMS(totalDuration);
      data.good = convertToHMS(totalDuration - slouchTime);
      data.bad = convertToHMS(slouchTime);
    }

    // return a spinner if component is fetching data
    if (this.props.loading) {
      return <Spinner />;
    }
    console.log(this.props.sessions);
    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._heading}>Posture Report</HeadingText>
        <View style={styles.dateContainer}>
          <TouchableOpacity
            onPress={this.onBackPress}
          >
            <View>
              <Icon
                name="angle-left"
                size={40}
                color="#900"
                style={styles.icons}
              />
            </View>
          </TouchableOpacity>
          <HeadingText size={2}>{data.date}</HeadingText>
          {rightArrow}
        </View>
        <View style={styles.chart}>
          <VictoryPie
            style={{
              labels: { fontSize: 14, fontWeight: 'bold' },
            }}
            data={data.chartData}
            innerRadius={80}
            x="label"
            y="duration"
            width={300}
            padding={{ top: 80, bottom: 0, left: 50, right: 50 }}
            animate={{
              duration: 700,
            }}
            colorScale={[
              'white',
              color.primaryColor,
            ]}
          />
          <View style={styles._total}>
            <HeadingText size={1}>{data.total ? 'Total' : ''}</HeadingText>
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
  }
}

const mapStateToProps = (state) => {
  let seen = {};
  // Sort the sessions
  // Merge the all the sessions with the same date
  const groupByDay = state.user.sessions
    .sort((a, b) => b.timestamp - a.timestamp) // sort from latest to oldest
    .filter((val) => {
      const date = new Date(val.timestamp);

      if (new Date(seen.timestamp).toDateString() === (date.toDateString())) {
        seen.sessionTime += val.sessionTime;
        seen.slouchTime += val.slouchTime;
        seen.totalDuration += val.totalDuration;
        // Don't keep this value, It's merged
        return false;
      }

      // remember this obj
      seen = val;
      return true;
    });

  return {
    sessions: groupByDay,
    loading: state.user.isUpdating,
  };
};

export default connect(mapStateToProps)(PostureReport);
