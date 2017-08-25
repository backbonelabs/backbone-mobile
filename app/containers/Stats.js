import React, { Component, PropTypes } from 'react';
import {
  View,
  InteractionManager,
} from 'react-native';
import autobind from 'class-autobind';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import moment from 'moment';
import { connect } from 'react-redux';
import styles from '../styles/stats';
import userActions from '../actions/user';
import Spinner from '../components/Spinner';
import Graph from '../components/Graph';

const today = moment();
const sixDaysAgo = moment().subtract(6, 'day');
const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const totalSessionStats = (sessions) => (
  Object.keys(sessions).reduce((acc, val) => {
    /* eslint-disable */
    const good = sessions[val].totalDuration - sessions[val].slouchTime;
    const poor = sessions[val].slouchTime;

    if (acc["good"]) {
      acc["good"] += good;
      acc["poor"] += poor;
      return acc;
    }
    acc["good"] = good;
    acc["poor"] = poor;
    return acc;
    /* eslint-enable */
  }, {})
);

class Stats extends Component {
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
      sessionsByMonth: {},
      sessionsByHour: {},
      sessionsByDays: {},
      selectedTab: 'Today',
      selectedTabTotalSessions: [],
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
      const sessionsByMonth = nextProps.sessions
      .sort((a, b) => a.timestamp - b.timestamp) // sort from oldest to latest
      .reduce((acc, val) => {
        const month = moment(val.timestamp).format('MMM');
        /* eslint-disable */

        if (acc[month]) {
          acc[month].sessionTime += val.sessionTime;
          acc[month].slouchTime += val.slouchTime;
          acc[month].totalDuration += val.totalDuration;

          return acc;
        }

        acc[month] = Object.assign({}, val);

        return acc;
        /* eslint-enable */
      }, {});
      const sessionsByHour = nextProps.sessions
      .sort((a, b) => a.timestamp - b.timestamp) // sort from oldest to latest
      .reduce((acc, val) => {
        const date = moment(val.timestamp);
        const time = moment(val.timestamp).format('ha'); // eg: 5pm
        /* eslint-disable */

        if (today.isSame(date, 'day')) {
          if (acc[time]) {
            acc[time].sessionTime += val.sessionTime;
            acc[time].slouchTime += val.slouchTime;
            acc[time].totalDuration += val.totalDuration;

            return acc;
          }

          acc[time] = Object.assign({}, val);

          return acc;
        }

        return acc;
        /* eslint-enable */
      }, {});
      const sessionsByDays = nextProps.sessions
      .sort((a, b) => a.timestamp - b.timestamp) // sort from oldest to latest
      .reduce((acc, val) => {
        const date = moment(val.timestamp);
        const dayOfWeek = week[date.format('e')];
        /* eslint-disable */

        if (
          (today.isSame(date, 'd') || date < today) &&
          (sixDaysAgo.isSame(date, 'd') || date > sixDaysAgo)
        ) {
          console.log(date, dayOfWeek)
          if (acc[dayOfWeek]) {
            acc[dayOfWeek].sessionTime += val.sessionTime;
            acc[dayOfWeek].slouchTime += val.slouchTime;
            acc[dayOfWeek].totalDuration += val.totalDuration;

            return acc;
          }

          acc[dayOfWeek] = Object.assign({}, val);

          return acc;
        }

        return acc;
        /* eslint-enable */
      }, {});
      this.setState({
        sessionsByMonth,
        sessionsByHour,
        sessionsByDays,
        selectedTabTotalSessions: totalSessionStats(sessionsByHour), // default is Today
      });
    }
  }

  selectTab(tab) {
    const { sessionsByDays, sessionsByHour, sessionsByMonth } = this.state;
    let selectedTab;
    let selectedTabTotalSessions;
    switch (tab.i) {
      case 0:
        selectedTab = 'Today';
        selectedTabTotalSessions = totalSessionStats(sessionsByHour);
        break;
      case 1:
        selectedTab = 'Week';
        selectedTabTotalSessions = totalSessionStats(sessionsByDays);
        break;
      case 2:
        selectedTab = 'Month';
        selectedTabTotalSessions = totalSessionStats(sessionsByMonth);
        break;
      default:
        selectedTab = 'Today';
        selectedTabTotalSessions = totalSessionStats(sessionsByHour);
    }
    this.setState({ selectedTab, selectedTabTotalSessions }); // i is the index, [0,1,2]
  }

  renderGraph() {
    const {
      selectedTab,
      selectedTabTotalSessions,
      sessionsByHour,
      sessionsByDays,
      sessionsByMonth,
    } = this.state;
    let data;
    switch (selectedTab) {
      case 'Today':
        data = sessionsByHour;
        break;
      case 'Week':
        data = sessionsByDays;
        break;
      case 'Month':
        data = sessionsByMonth;
        break;
      default:
        data = sessionsByHour;
    }

    return (
      <Graph
        data={data}
        selectedTab={selectedTab}
        goodTime={Math.round(selectedTabTotalSessions.good / 60)}
        poorTime={Math.round(selectedTabTotalSessions.poor / 60)}
      />
    );
  }

  render() {
    if (this.props.isFetchingSessions || this.state.loading) {
      return <Spinner />;
    }

    return (
      <View style={styles.container}>
        <View style={styles.graphContainer}>
          {this.renderGraph()}
        </View>
        <ScrollableTabView
          style={styles.tabs}
          onChangeTab={this.selectTab}
          tabBarPosition="top"
          tabBarActiveTextColor="#2196F3"
          tabBarInactiveTextColor="#bdbdbd"
          tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
          tabBarTextStyle={styles.tabBarTextStyle}
        >
          <View tabLabel="Today" />
          <View tabLabel="Week" />
          <View tabLabel="Month" />
        </ScrollableTabView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  sessions: state.user.sessions,
  isFetchingSessions: state.user.isFetchingSessions,
});

export default connect(mapStateToProps)(Stats);
