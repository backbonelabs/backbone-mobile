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
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/freeTraining';
import SecondaryText from '../components/SecondaryText';
import FreeTrainingTabBar from './FreeTrainingTabBar';
import mongoDb from '../workouts.js';

class FreeTraining extends Component {

  constructor() {
    super();
    autobind(this);
    this.state = {
      bounceValue: new Animated.Value(600),  // This is the initial position of the subview
      buttonText: 'Show Subview',
      isHidden: true,
      sortBy: 0,
    };
    this.sortCategories = [
      'ALPHABETICAL ORDER (A-Z)',
      'POPULARITY',
      'DIFFICULTY'];
    this.dataSource = [
      { title: 'EXERCISES', type: 1, workouts: [] },
      { title: 'STRETCHES', type: 2, workouts: [] },
      { title: 'POSTURE', type: 3, workouts: [] },
    ];
    // Temporary workout database generated randomly
    mongoDb.forEach((workout) => {
      if (workout.type === this.dataSource[0].type) {
        this.dataSource[0].workouts.push(workout);
      } else if (workout.type === this.dataSource[1].type) {
        this.dataSource[1].workouts.push(workout);
      } else if (workout.type === this.dataSource[2].type) {
        this.dataSource[2].workouts.push(workout);
      }
    });
  }

  getDataSource(dbSource) {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    return dataSource.cloneWithRowsAndSections(this.convertDataToMap(dbSource));
  }

  convertDataToMap(data) {
    const itemMap = [];
    if (this.state.sortBy === 0) {
      data.workouts.map((v) => v.title).sort().forEach((item) => {
        if (!itemMap[item[0]]) {
          itemMap[item[0]] = [];
        }
        itemMap[item[0]].push(item);
      });
    } else if (this.state.sortBy === 1) {
      data.workouts.sort((a, b) => b.popularity - a.popularity);
      itemMap['Most Popular'] = data.workouts.map((v) => v.title);
    } else if (this.state.sortBy === 2) {
      data.workouts.sort((a, b) => a.difficulty - b.difficulty).forEach((item) => {
        let difficultyLabel = '';
        switch (item.difficulty) {
          case 1:
            difficultyLabel = 'Beginner';
            break;
          case 2:
            difficultyLabel = 'Intermediate';
            break;
          case 3:
            difficultyLabel = 'Advance';
            break;
          default:
            difficultyLabel = 'Pro';
        }
        if (!itemMap[difficultyLabel]) {
          itemMap[difficultyLabel] = [];
        }
        itemMap[difficultyLabel].push(item.title);
      });
    }
    return itemMap;
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
    const activityViews = this.dataSource.map((workoutList) =>
    (<ListView
      key={workoutList.title}
      tabLabel={workoutList.title}
      dataSource={this.getDataSource(workoutList)}
      renderRow={this.renderRow}
      onPressRow={() => {}}
      renderSectionHeader={this.renderSectionHeader}
    />)
    );

    const sortViews = this.sortCategories.map((label, index) => (
      <TouchableOpacity
        key={label}
        style={styles.subViewSortButton}
        onPress={() => {
          this.setState({ sortBy: index });
          this.toggleSubview();
        }}
      >
        <Text style={styles.subViewSortButtonText}>{label}</Text>
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
