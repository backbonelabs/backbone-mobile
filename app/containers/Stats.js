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

const getCurrentSessions = (amount, type, format) => {
  const sessions = [];
  for (let i = 0; i <= amount; i++) {
    sessions.push(moment().subtract(i, type).format(format));
  }
  return sessions;
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
      const sixDaysAgo = moment().subtract(6, 'day');
      const thirtyDaysAgo = moment().subtract(29, 'day');
      const sessions = nextProps.sessions
        .sort((a, b) => a.timestamp - b.timestamp); // sort from oldest to latest

      const sessionsByMonth = sessions
        .reduce((acc, val, index) => {
          const date = moment(val.timestamp);
          const formatedDate = date.format('MM/DD');
          /* eslint-disable no-param-reassign */

          if (date.isBetween(thirtyDaysAgo, today, null, '[]')) {
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

          if (date.isBetween(sixDaysAgo, today, null, '[]')) {
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
    const { sessionsByDays, sessionsByHour, sessionsByMonth, sessionsByYear } = this.state;
    let selectedTab;
    let selectedTabTotalSessions;
    switch (tab.i) {
      case 1:
        selectedTab = 'Week';
        selectedTabTotalSessions = totalSessionStats(sessionsByDays);
        break;
      case 2:
        selectedTab = 'Month';
        selectedTabTotalSessions = totalSessionStats(sessionsByMonth);
        break;
      case 3:
        selectedTab = 'Year';
        selectedTabTotalSessions = totalSessionStats(sessionsByYear);
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
      sessionsByYear,
    } = this.state;
    let data;

    switch (selectedTab) {
      case 'Today':
        data = getCurrentSessions(23, 'hours', 'ha').map((val) => {
          if (sessionsByHour[val]) {
            return sessionsByHour[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        break;
      case 'Week':
        data = getCurrentSessions(6, 'days', 'ddd').map((val) => {
          if (sessionsByDays[val]) {
            return sessionsByDays[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        break;
      case 'Month':
        data = getCurrentSessions(29, 'days', 'MM/DD').map((val) => {
          if (sessionsByMonth[val]) {
            return sessionsByMonth[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        break;
      case 'Year':
        data = getCurrentSessions(11, 'months', 'MMM').map((val) => {
          if (sessionsByYear[val]) {
            return sessionsByYear[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        break;
      default:
        data = getCurrentSessions(23, 'hours', 'ha').map((val) => {
          if (sessionsByHour[val]) {
            return sessionsByHour[val];
          }
          return {
            slouchTime: 0,
            totalDuration: 0,
            label: val,
          };
        });
        break;
    }

    return (
      <Graph
        data={data}
        noCurrentSessions={(!selectedTabTotalSessions.good && !selectedTabTotalSessions.poor)}
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
            <HeadingText size={1} >{ this.state.selectedTab }</HeadingText>
            <View style={styles.sessionRatingContainer}>
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
