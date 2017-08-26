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
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';

const today = moment();
const sixDaysAgo = moment().subtract(6, 'day');
const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const totalSessionStats = (sessions) => (
  Object.keys(sessions).reduce((acc, val) => {
    /* eslint-disable no-param-reassign */
    const good = sessions[val].totalDuration - sessions[val].slouchTime;
    const poor = sessions[val].slouchTime;

    if (acc.good) {
      acc.good += good;
      acc.poor += poor;
      return acc;
    }
    acc.good = good;
    acc.poor = poor;
    return acc;
    /* eslint-disable no-param-reassign */
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
      loading: true,
    };
  }

  componentDidMount() {
    const fromDate = moment().subtract(12, 'months').startOf('month').toISOString();
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
    if (this.props.isFetchingSessions !== nextProps.isFetchingSessions) {
      const sessionsByMonth = nextProps.sessions
      .sort((a, b) => a.timestamp - b.timestamp) // sort from oldest to latest
      .reduce((acc, val) => {
        const month = moment(val.timestamp).format('MMM');
        /* eslint-disable no-param-reassign */

        if (acc[month]) {
          acc[month].slouchTime += val.slouchTime;
          acc[month].totalDuration += val.totalDuration;

          return acc;
        }

        acc[month] = Object.assign({}, val);

        return acc;
        /* eslint-disable no-param-reassign */
      }, {});
      const sessionsByHour = nextProps.sessions
      .sort((a, b) => a.timestamp - b.timestamp) // sort from oldest to latest
      .reduce((acc, val) => {
        const date = moment(val.timestamp);
        const time = moment(val.timestamp).format('ha'); // eg: 5pm
        /* eslint-disable no-param-reassign */

        if (today.isSame(date, 'day')) {
          if (acc[time]) {
            acc[time].slouchTime += val.slouchTime;
            acc[time].totalDuration += val.totalDuration;

            return acc;
          }

          acc[time] = Object.assign({}, val);

          return acc;
        }

        return acc;
        /* eslint-disable no-param-reassign */
      }, {});
      const sessionsByDays = nextProps.sessions
      .sort((a, b) => a.timestamp - b.timestamp) // sort from oldest to latest
      .reduce((acc, val) => {
        const date = moment(val.timestamp);
        const dayOfWeek = week[date.format('e')];
        /* eslint-disable no-param-reassign */

        if (
          (today.isSame(date, 'd') || date < today) &&
          (sixDaysAgo.isSame(date, 'd') || date > sixDaysAgo)
        ) {
          if (acc[dayOfWeek]) {
            acc[dayOfWeek].slouchTime += val.slouchTime;
            acc[dayOfWeek].totalDuration += val.totalDuration;

            return acc;
          }

          acc[dayOfWeek] = Object.assign({}, val);

          return acc;
        }

        return acc;
        /* eslint-disable no-param-reassign */
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
        goodTime={Math.round(selectedTabTotalSessions.good / 60)}
        poorTime={Math.round(selectedTabTotalSessions.poor / 60)}
      />
    );
  }

  render() {
    const { loading, selectedTabTotalSessions } = this.state;
    const good = Math.round(selectedTabTotalSessions.good / 60);
    const poor = Math.round(selectedTabTotalSessions.poor / 60);
    const justifyContent = (good || poor) ? 'flex-end' : 'center';

    if (this.props.isFetchingSessions || loading) {
      return <Spinner />;
    }

    return (
      <View style={styles.container}>
        <View style={[styles.graphContainer, { justifyContent }]}>
          <View style={styles.graphInnerContainer}>
            { (good || poor) ? <View style={styles.heading}>
              <HeadingText size={1} >{ this.state.selectedTab }</HeadingText>
              <View style={styles.sessionRatingContainer}>
                <BodyText style={styles._goodRating}>
                  Good: {good} MIN
                </BodyText>
                <BodyText style={styles._poorRating}>
                  Poor: {poor} MIN
                </BodyText>
              </View>
            </View> : null
            }
            {this.renderGraph()}
          </View>
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
