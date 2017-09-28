import React, { Component, PropTypes } from 'react';
import { View, InteractionManager } from 'react-native';
import autobind from 'class-autobind';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import moment from 'moment';
import { connect } from 'react-redux';
import styles from '../styles/stats';
import theme from '../styles/theme';
import userActions from '../actions/user';
import Spinner from '../components/Spinner';
import Graph from '../components/Graph';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';

const days = ['Sat', 'Fri', 'Thur', 'Wed', 'Tue', 'Mon', 'Sun'];
const months = ['Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul', 'Jun', 'May', 'Apr', 'Mar', 'Feb', 'Jan'];
const times = [
  '11pm', '10pm', '9pm', '8pm', '7pm', '6pm', '5pm', '4pm',
  '3pm', '2pm', '1pm', '12pm', '11am', '10am', '9am', '8am',
  '7am', '6am', '5am', '4am', '3am', '2am', '1am', '12am',
];

const getDaysArrayByMonth = () => {
  let daysInMonth = moment().daysInMonth();
  const arrDays = [];

  while (daysInMonth) {
    let current = moment().date(daysInMonth).format('DD');
    // remove leading zero 01-09
    if (current[0] === '0') {
      current = current[1];
    }
    arrDays.push(current);
    daysInMonth--;
  }

  return arrDays;
};

const convertToHours = (secs) => {
  let minutes = Math.floor(secs / 60);
  const hours = Math.floor(minutes / 60);
  minutes %= 60;
  const min = (minutes > 0) ? `${minutes} MIN` : '';
  return `${hours} HR ${min}`;
};

const totalSessionStats = (sessions) => (
  Object.keys(sessions).reduce((acc, val) => {
    /* eslint-disable no-param-reassign */
    const good = sessions[val].totalDuration - sessions[val].slouchTime;
    const poor = sessions[val].slouchTime;

    acc.good += good;
    acc.poor += poor;

    return acc;
    /* eslint-disable no-param-reassign */
  }, { good: 0, poor: 0 })
);

const getHighestDuration = (sessions) => {
  if (sessions.length === 0) {
    return 0;
  }

  let greatest = sessions[0].totalDuration;

  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i].totalDuration > greatest) {
      greatest = sessions[i].totalDuration;
    }
  }

  return Math.ceil(greatest / 60);
};

const yAxisValues = (time) => {
  const yAxisArray = [];
  let splitTime;
  let counter = 0;

  if ((time === 1) || (time === 0)) {
    return [0, 1];
  }

  if (time < 10) {
    splitTime = time / 4;
  } else if (time < 100) {
    splitTime = (Math.ceil(time / 10) * 10) / 4;
  } else if (time < 1000) {
    splitTime = (Math.ceil(time / 100) * 100) / 4;
  } else {
    splitTime = (Math.ceil(time / 1000) * 1000) / 4;
  }

  while (counter <= time) {
    counter += Math.round(splitTime);
    yAxisArray.push(counter);
  }

  return yAxisArray;
};

const xAxisValues = (data) => data.map((val) => val.label);

class Stats extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    sessions: PropTypes.array,
    isFetchingSessions: PropTypes.bool,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
    training: PropTypes.object,
  }

  constructor(props) {
    super(props);
    autobind(this);
    this.state = {
      sessionsByMonth: {},
      sessionsByHour: {},
      sessionsByDays: {},
      sessionsByYear: {},
      selectedTab: 'Today',
      showHeader: 'Today',
      selectedTabTotalSessions: [],
      loading: true,
    };
  }

  componentDidMount() {
    const fromDate = moment().subtract(11, 'months').startOf('month').toISOString();
    const toDate = moment().endOf('month').toISOString();
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(userActions.fetchUserSessions({
        fromDate,
        toDate,
      }));
      this.setState({ loading: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isFetchingSessions && !nextProps.isFetchingSessions) {
      const today = moment();
      const startOfMonth = moment().startOf('month');
      const endOfMonth = moment().endOf('month');
      const startOfWeek = moment().startOf('week');
      const endOfWeek = moment().endOf('week');
      const sessions = nextProps.sessions
        .sort((a, b) => a.timestamp - b.timestamp); // sort from oldest to latest

      const sessionsByMonth = sessions
        .reduce((acc, val, index) => {
          const date = moment(val.timestamp);
          const formatedDate = date.format('DD');
          /* eslint-disable no-param-reassign */

          if (date.isBetween(startOfMonth, endOfMonth, null, '[]')) {
            if (acc[formatedDate]) {
              acc[formatedDate].slouchTime += val.slouchTime;
              acc[formatedDate].totalDuration += val.totalDuration;

              return acc;
            }

            acc[formatedDate] = Object.assign({}, val, { index, label: formatedDate });

            return acc;
          }

          return acc;
          /* eslint-disable no-param-reassign */
        }, {});
      const sessionsByHour = sessions
        .reduce((acc, val, index) => {
          const date = moment(val.timestamp);
          const time = moment(val.timestamp).format('ha'); // eg: 5pm
          /* eslint-disable no-param-reassign */

          if (today.isSame(date, 'day')) {
            if (acc[time]) {
              acc[time].slouchTime += val.slouchTime;
              acc[time].totalDuration += val.totalDuration;

              return acc;
            }

            acc[time] = Object.assign({}, val, { index, label: time });

            return acc;
          }

          return acc;
          /* eslint-disable no-param-reassign */
        }, {});
      const sessionsByDays = sessions
        .reduce((acc, val, index) => {
          const date = moment(val.timestamp);
          const dayOfWeek = date.format('ddd');
          /* eslint-disable no-param-reassign */

          if (date.isBetween(startOfWeek, endOfWeek, null, '[]')) {
            if (acc[dayOfWeek]) {
              acc[dayOfWeek].slouchTime += val.slouchTime;
              acc[dayOfWeek].totalDuration += val.totalDuration;

              return acc;
            }

            acc[dayOfWeek] = Object.assign({}, val, { index, label: dayOfWeek });

            return acc;
          }

          return acc;
          /* eslint-disable no-param-reassign */
        }, {});
      const sessionsByYear = sessions
        .reduce((acc, val, index) => {
          const month = moment(val.timestamp).format('MMM');
          /* eslint-disable no-param-reassign */

          if (acc[month]) {
            acc[month].slouchTime += val.slouchTime;
            acc[month].totalDuration += val.totalDuration;

            return acc;
          }

          acc[month] = Object.assign({}, val, { index, label: month });

          return acc;
          /* eslint-disable no-param-reassign */
        }, {});
      this.setState({
        sessionsByMonth,
        sessionsByHour,
        sessionsByDays,
        sessionsByYear,
        selectedTabTotalSessions: totalSessionStats(sessionsByHour), // default is Today
      });
    }
  }

  selectTab(tab) {
    const {
      sessionsByDays,
      sessionsByHour,
      sessionsByMonth,
      sessionsByYear,
    } = this.state;
    let selectedTab;
    let showHeader;
    let selectedTabTotalSessions;
    const shortMonth = moment().format('MMM');
    const startOfWeek = moment().startOf('week').date();
    const endOfWeek = moment().endOf('week').date();
    const year = moment().format('gggg');

    switch (tab.i) {
      case 1:
        selectedTab = 'Week';
        showHeader = `${shortMonth} ${startOfWeek} - ${endOfWeek}, ${year}`;
        selectedTabTotalSessions = totalSessionStats(sessionsByDays);
        break;
      case 2:
        selectedTab = 'Month';
        showHeader = `${shortMonth} ${year}`;
        selectedTabTotalSessions = totalSessionStats(sessionsByMonth);
        break;
      case 3:
        selectedTab = 'Year';
        showHeader = year;
        selectedTabTotalSessions = totalSessionStats(sessionsByYear);
        break;
      default:
        selectedTab = 'Today';
        showHeader = 'Today';
        selectedTabTotalSessions = totalSessionStats(sessionsByHour);
    }

    this.setState({ selectedTab, showHeader, selectedTabTotalSessions }); // i is the index, [0,1,2]
  }

  renderGraph() {
    const {
      selectedTab,
      selectedTabTotalSessions,
      sessionsByHour,
      sessionsByDays,
      sessionsByMonth,
      sessionsByYear,
    } = this.state;
    let data = [];
    let xAxisLabel;
    const shortMonth = moment().format('MMM');
    const startOfWeek = moment().startOf('week').date();
    const endOfWeek = moment().endOf('week').date();

    const today = moment().date();

    switch (selectedTab) {
      case 'Week':
        data = days.map((val) => {
          if (sessionsByDays[val]) {
            return sessionsByDays[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        xAxisLabel = `${shortMonth} ${startOfWeek} - ${endOfWeek}`;
        break;
      case 'Month':
        data = getDaysArrayByMonth().map((val) => {
          if (sessionsByMonth[val]) {
            return sessionsByMonth[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        xAxisLabel = this.state.showHeader;
        break;
      case 'Year':
        data = months.map((val) => {
          if (sessionsByYear[val]) {
            return sessionsByYear[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        xAxisLabel = this.state.showHeader;
        break;
      default:
        data = times.map((val) => {
          if (sessionsByHour[val]) {
            return sessionsByHour[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        xAxisLabel = `${shortMonth} ${today}`;
        break;
    }

    return (
      <Graph
        data={data}
        noCurrentSessions={(!selectedTabTotalSessions.good && !selectedTabTotalSessions.poor)}
        xAxisLabel={xAxisLabel}
        yAxisTickValues={yAxisValues(getHighestDuration(data))}
        xAxisTickValues={xAxisValues(data)}
      />
    );
  }

  render() {
    const { loading, selectedTabTotalSessions } = this.state;
    const goodSessions = selectedTabTotalSessions.good;
    const poorSessions = selectedTabTotalSessions.poor;
    let good = `${Math.ceil(goodSessions / 60)} MIN`;
    let poor = `${Math.ceil(poorSessions / 60)} MIN`;

    if (this.props.isFetchingSessions || loading) {
      return <Spinner />;
    }

    // If below a minute, show seconds
    if (goodSessions < 60) {
      good = `${goodSessions} SEC`;
    }
    if (poorSessions < 60) {
      poor = `${poorSessions} SEC`;
    }

    // If over 60 minute, show hours
    if (goodSessions >= 3600) {
      good = `${convertToHours(goodSessions)}`;
    }
    if (poorSessions >= 3600) {
      poor = `${convertToHours(poorSessions)}`;
    }

    return (
      <View style={styles.container}>
        <View style={styles.tabs}>
          <ScrollableTabView
            onChangeTab={this.selectTab}
            tabBarPosition="bottom"
            tabBarActiveTextColor={theme.lightBlue500}
            tabBarInactiveTextColor={theme.grey400}
            tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
            tabBarTextStyle={styles.tabBarTextStyle}
          >
            <View tabLabel="Today" />
            <View tabLabel="Week" />
            <View tabLabel="Month" />
            <View tabLabel="Year" />
          </ScrollableTabView>
        </View>
        <View style={styles.graphContainer}>
          { (goodSessions || poorSessions) ? <View style={styles.heading}>
            <HeadingText size={1}>{ this.state.showHeader }</HeadingText>
            <View style={styles.sessionRatingContainer}>
              <HeadingText size={2}>Total</HeadingText>
              <BodyText style={styles.goodRating}>
                GOOD: {good}
              </BodyText>
              <BodyText style={styles.poorRating}>
                POOR: {poor}
              </BodyText>
            </View>
          </View> : null
            }
          {this.renderGraph()}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  sessions: state.user.sessions,
  isFetchingSessions: state.user.isFetchingSessions,
  training: state.training,
});

export default connect(mapStateToProps)(Stats);
