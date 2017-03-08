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
    loading: PropTypes.bool,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      sessions: {},
      startDate: moment().format('YYYY-MM-DD'),
      fromDate: moment().subtract(2, 'months').startOf('month').format('YYYY-MM-DD'),
      toDate: moment().endOf('month').format('YYYY-MM-DD'),
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
        const accCopy = Object.assign({}, acc);

        if (acc[date]) {
          accCopy[date].sessionTime += val.sessionTime;
          accCopy[date].slouchTime += val.slouchTime;
          accCopy[date].totalDuration += val.totalDuration;

          return accCopy;
        }

        accCopy[date] = val;

        return accCopy;
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
    const fromDateMonth = moment(this.state.startDate)
      .startOf('month').subtract(2, 'months').format('YYYY-MM-DD');
    const toDateMonth = moment(this.state.startDate)
      .startOf('month').subtract(1, 'months').format('YYYY-MM-DD');

    if (selectedMonth === fromDateMonth) {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      }));
      return this.setState({
        startDate: fromDateMonth,
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      });
    }

    return null;
  }

  @autobind
  onTouchNext(date) {
    const selectedMonth = date.startOf('month').format('YYYY-MM-DD');
    const fromDateMonth = moment(this.state.startDate)
      .startOf('month').add(2, 'months').format('YYYY-MM-DD');
    const toDateMonth = moment(this.state.startDate)
      .startOf('month').add(4, 'months').format('YYYY-MM-DD');

    if (selectedMonth === fromDateMonth) {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      }));
      return this.setState({
        startDate: fromDateMonth,
        fromDate: fromDateMonth,
        toDate: toDateMonth,
      });
    }

    return null;
  }

  render() {
    const events = (Object.keys(this.state.sessions));
    // return a spinner if component is fetching data
    if (this.props.loading || this.state.loading) {
      return <Spinner />;
    }
    return (
      <View style={styles.container}>
        <HeadingText size={1} style={styles._heading}>Calendar</HeadingText>
        <Calendar
          showEventIndicators
          showControls
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
  loading: state.user.isUpdating,
});

export default connect(mapStateToProps)(PostureReport);
