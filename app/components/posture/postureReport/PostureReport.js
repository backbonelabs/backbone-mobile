import React, { Component, PropTypes } from 'react';
import {
  View,
  InteractionManager,
} from 'react-native';
import Calendar from 'react-native-calendar';
import autobind from 'class-autobind';
import moment from 'moment';
import { connect } from 'react-redux';
import styles from '../../../styles/posture/postureReport';
import HeadingText from '../../../components/HeadingText';
import userActions from '../../../actions/user';
import Spinner from '../../Spinner';
import routes from '../../../routes';

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
    autobind(this);
    this.state = {
      sessions: {},
      startDate: moment().format('YYYY-MM-DD'),
      fromDate: moment().subtract(1, 'months').startOf('month'),
      toDate: moment().add(1, 'months').endOf('month'),
      loading: true,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: this.state.fromDate.toISOString(),
        toDate: this.state.toDate.toISOString(),
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

        if (acc[date]) {
          acc[date].sessionTime += val.sessionTime;
          acc[date].slouchTime += val.slouchTime;
          acc[date].totalDuration += val.totalDuration;

          return acc;
        }

        acc[date] = Object.assign({}, val);

        return acc;
        /* eslint-enable */
      }, {});
      this.setState({ sessions: groupByDay });
    }
  }

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

  onTouchPrev(date) {
    const { startDate } = this.state;
    const selectedMonth = date.startOf('month').format('YYYY-MM-DD');
    const fetchDate = moment(startDate).subtract(2, 'months').startOf('month').format('YYYY-MM-DD');
    const fromDateMonth = moment(fetchDate).startOf('month').subtract(1, 'months');
    const toDateMonth = moment(fetchDate).endOf('month').add(1, 'months');

    if (selectedMonth === fetchDate) {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: fromDateMonth.toISOString(),
        toDate: toDateMonth.toISOString(),
      }));
      return this.setState({
        startDate: fetchDate,
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      });
    }

    return null;
  }

  onTouchNext(date) {
    const { startDate } = this.state;
    const selectedMonth = date.startOf('month').format('YYYY-MM-DD');
    const fetchDate = moment(startDate).add(2, 'months').startOf('month').format('YYYY-MM-DD');
    const fromDateMonth = moment(fetchDate).startOf('month').subtract(1, 'months');
    const toDateMonth = moment(fetchDate).endOf('month').add(1, 'months');

    if (selectedMonth === fetchDate) {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: fromDateMonth.toISOString(),
        toDate: toDateMonth.toISOString(),
      }));
      return this.setState({
        startDate: fetchDate,
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      });
    }

    return null;
  }

  render() {
    const calendarStyles = {
      calendarContainer: styles._calendarContainer,
      currentDayCircle: styles._currentDayCircle,
      currentDayText: styles._currentDayText,
      hasEventCircle: styles._hasEventCircle,
      hasEventText: styles._hasEventText,
      day: styles._day,
      weekendDayText: styles._weekendDayText,
      controlButtonText: styles._controlButtonText,
      title: styles._title,
      dayHeading: styles._dayHeading,
      weekendHeading: styles._weekendHeading,
    };
    const events = (Object.keys(this.state.sessions));
    // return a spinner if component is fetching data
    if (this.props.isFetchingSessions || this.state.loading) {
      return <Spinner />;
    }

    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles.heading}>Calendar</HeadingText>
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
