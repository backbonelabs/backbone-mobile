import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import autobind from 'class-autobind';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
// import styles from '../styles/freeTraining';
import styles from '../styles/freeTraining';
import SecondaryText from '../components/SecondaryText';
import FreeTrainingTabBar from './FreeTrainingTabBar';

class FreeTraining extends Component {

  constructor() {
    super();
    autobind(this);
    this.sortCategories = ['ALPHABETICAL ORDER (A-Z)', 'POPULARITY', 'EXERCISE', 'DIFFICULTY'];
    this.db = [
      {
        name: 'POSTURE',
        workout: [
          'Standing',
          'Beginner Seated',
          'Intermediate Seated',
          'Advanced Seated',
          'Walking',
          'Running',
          'Infinite',
        ],
      },
      {
        name: 'EXERCISES',
        workout: [
          'Push-ups',
          'Pull-ups',
          'Squats',
          'Bench press',
          'Overhead press',
          'Band Pull-Apart',
          'Bird Dog',
          'No Money',
          'Plank',
          'Side Plank',
          'Dead Bug',
        ],
      },
      {
        name: 'STRETCHES',
        workout: [
          'Chest',
          'Bully',
          'Lat',
          'Calf',
          'Couch',
          'Low Back',
          'Hamstring with Band',
          'Quad',
          'Pidgeon',
          'Garland Pose',
          'Extended Side Angle',
        ],
      },
    ];
    this.state = {
      bounceValue: new Animated.Value(600),  // This is the initial position of the subview
      buttonText: 'Show Subview',
      isHidden: true,
    };
  }

  getDataSource(dbSource) {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    return dataSource.cloneWithRowsAndSections(this.convertDataToMap(dbSource));
  }

  toggleSubview() {
    const { isHidden } = this.state;

    let toValue = 600;

    if (isHidden) {
      toValue = 0;
    }

    // This will animate the transalteY of the subview between 0 & 100
    // depending on its current state 100 comes from the style below,
    // which is the height of the subview.
    Animated.spring(
      this.state.bounceValue,
      {
        toValue,
        velocity: 3,
        tension: 2,
        friction: 8,
      }
    ).start();

    this.setState({ isHidden: !isHidden });
  }

  convertDataToMap(data) {
    const itemMap = {};
    data.sort().forEach((item) => {
      if (!itemMap[item[0]]) {
        itemMap[item[0]] = [];
      }
      itemMap[item[0]].push(item);
    });

    return itemMap;
  }
  renderRow(rowData) {
    return (
      <View style={{ flexDirection: 'column' }}>
        <View style={styles.listContainer}>
          <View style={styles.listInnerContainer}>
            <View style={styles.preview} />
            <SecondaryText style={styles._listText}>{rowData}</SecondaryText>
          </View>
          <FontAwesomeIcon name="heart" style={styles._icon} size={25} />
        </View>
        <View style={styles.barContainer}>
          <View style={styles.bar} />
        </View>
      </View>
    );
  }

  renderSectionHeader(sectionData, category) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>{category}</Text>
      </View>
    );
  }

  render() {
    const activityViews = this.db.map((plan) =>
      (<ListView
        key={plan.name}
        tabLabel={plan.name}
        dataSource={this.getDataSource(plan.workout)}
        renderRow={this.renderRow}
        onPressRow={() => {}}
        renderSectionHeader={this.renderSectionHeader}
      />)
    );

    const sortViews = this.sortCategories.map((category) => (
      <TouchableOpacity key={category} style={styles.subViewSortButton}>
        <Text style={styles.subViewSortButtonText}>{category}</Text>
      </TouchableOpacity>
    ));
    return (
      <View style={{ height: '100%', alignItems: 'center' }}>
        <ScrollableTabView
          style={styles.container}
          renderTabBar={() => <FreeTrainingTabBar toggleSubview={this.toggleSubview} />}
          tabBarPosition="top"
          tabBarActiveTextColor="#2196F3"
          tabBarInactiveTextColor="#bdbdbd"
          tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
          tabBarTextStyle={styles.tabBarTextStyle}
        >
          {activityViews}
        </ScrollableTabView>
        <Animated.View
          style={[styles.subView,
              { transform: [{ translateY: this.state.bounceValue }] }]}
        >
          <View style={styles.subViewButtonContainer}>
            <Text style={styles.subViewHeaderText}>CATEGORIZED LIST:</Text>
            {sortViews}
          </View>
          <TouchableOpacity
            onPress={() => { this.toggleSubview(); }}
            style={styles.subViewCancelButton}
          >
            <Text style={styles.subViewCancel}>CANCEL</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}
export default FreeTraining;
