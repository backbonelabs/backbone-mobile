import React, { Component, PropTypes } from 'react';
import { View, Image } from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import BodyText from '../components/BodyText';
import Card from '../components/Card';
import BG from '../images/dashboard-bg-plain-orange.jpg';
import polygonSm from '../images/polygon-sm.png';
import polygonLg from '../images/polygon-lg.png';
import bulletOrangeOn from '../images/bullet-orange-on.png';
import styles from '../styles/dashboard';

class Dashboard extends Component {
  static propTypes = {
    guidedTraining: PropTypes.shape({
      levels: PropTypes.array,
      selectedLevel: PropTypes.number,
      selectedSession: PropTypes.number,
    }),
  };

  constructor() {
    super();
    this.state = {};
  }

  @autobind
  getSessionPlan() {
    const {
      levels,
      selectedLevel,
      selectedSession,
    } = this.props.guidedTraining;
    const sessionActivities = levels[selectedLevel].sessions[selectedSession];
    return sessionActivities.map(activity => (
      <View key={activity.title} style={styles.sessionActivityRow}>
        <Image source={bulletOrangeOn} style={styles.activityBullet} />
        <BodyText key={activity.title}>{activity.title}</BodyText>
      </View>
    ));
  }

  render() {
    return (
      <Image source={BG} style={styles.backgroundImage}>
        <Image source={polygonSm} />
        <Image source={polygonLg} />
        <Card style={styles._mainSessionCard}>
          {this.getSessionPlan()}
        </Card>
      </Image>
    );
  }
}

const mapStateToProps = ({ guidedTraining }) => ({
  guidedTraining,
});

export default connect(mapStateToProps)(Dashboard);
