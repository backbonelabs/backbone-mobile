import React, { Component, PropTypes } from 'react';
import {
  View,
  InteractionManager,
} from 'react-native';
import Calendar from 'react-native-calendar';
import autobind from 'autobind-decorator';
import moment from 'moment';
import { connect } from 'react-redux';
import styles from '../../../styles/posture/postureReport';
import HeadingText from '../../../components/HeadingText';
import color from '../../../styles/theme';
import userActions from '../../../actions/user';
import Spinner from '../../Spinner';
import routes from '../../../routes';

const calendarStyles = {
  calendarContainer: {
    backgroundColor: 'transparent',
  },
  currentDayCircle: {
    backgroundColor: 'black',
  },
  currentDayText: {
    color: color.primaryColor,
  },
  hasEventCircle: {
    backgroundColor: color.primaryColor,
  },
  hasEventText: {
    color: 'white',
  },
};

class PostureReport extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    sessions: PropTypes.array,
    isFetchingSessions: PropTypes.bool,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      sessions: {},
      startDate: moment().format('YYYY-MM-DD'),
      fromDate: moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
      toDate: moment().add(1, 'months').endOf('month').format('YYYY-MM-DD'),
      loading: true,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: this.state.fromDate,
        toDate: this.state.toDate,
      }));
      this.setState({ loading: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sessions !== nextProps.sessions) {
      const groupByDay = nextProps.sessions
      .sort((a, b) => b.timestamp - a.timestamp) // sort from latest to oldest
      .reduce((acc, val) => {
        const date = moment(val.timestamp).format('YYYY-MM-DD');
        /* eslint-disable */
        acc[date] = Object.assign({}, val);

        if (acc[date]) {
          acc[date].sessionTime += val.sessionTime;
          acc[date].slouchTime += val.slouchTime;
          acc[date].totalDuration += val.totalDuration;

          return acc;
        }

        acc[date] = val;

        return acc;
        /* eslint-enable */
      }, {});
      this.setState({ sessions: groupByDay });
    }
  }

  @autobind
  onDateSelect(date) {
    const formatDate = moment(date).format('YYYY-MM-DD');
    const selectedSession = this.state.sessions[formatDate];

    if (selectedSession) {
      return this.props.navigator.push({
        ...routes.postureChart,
        props: {
          sessionDate: selectedSession,
        },
      });
    }

    return null;
  }

  @autobind
  onTouchPrev(date) {
    const selectedMonth = date.startOf('month').format('YYYY-MM-DD');
    const nextFetchDate = moment(this.state.startDate)
      .subtract(2, 'months').startOf('month').format('YYYY-MM-DD');
    const fromDateMonth = moment(nextFetchDate)
      .startOf('month').subtract(1, 'months').format('YYYY-MM-DD');
    const toDateMonth = moment(nextFetchDate)
      .endOf('month').add(1, 'months').format('YYYY-MM-DD');

    if (selectedMonth === nextFetchDate) {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      }));
      return this.setState({
        startDate: nextFetchDate,
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      });
    }

    return null;
  }

  @autobind
  onTouchNext(date) {
    const selectedMonth = date.startOf('month').format('YYYY-MM-DD');
    const nextFetchDate = moment(this.state.startDate)
      .add(2, 'months').startOf('month').format('YYYY-MM-DD');
    const fromDateMonth = moment(nextFetchDate)
      .startOf('month').subtract(1, 'months').format('YYYY-MM-DD');
    const toDateMonth = moment(nextFetchDate)
      .endOf('month').add(1, 'months').format('YYYY-MM-DD');

    if (selectedMonth === nextFetchDate) {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      }));
      return this.setState({
        startDate: nextFetchDate,
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      });
    }

    return null;
  }

  render() {
    const events = (Object.keys(this.state.sessions));
    // return a spinner if component is fetching data
    if (this.props.isFetchingSessions || this.state.loading) {
      return <Spinner />;
    }

    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._heading}>Calendar</HeadingText>
        <Calendar
          showEventIndicators
          showControls
          weekStart={0}
          onTouchPrev={this.onTouchPrev}
          onTouchNext={this.onTouchNext}
          onDateSelect={this.onDateSelect}
          eventDates={events}
          customStyle={calendarStyles}
          startDate={this.state.startDate}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  sessions: state.user.sessions,
  isFetchingSessions: state.user.isFetchingSessions,
});

export default connect(mapStateToProps)(PostureReport);
