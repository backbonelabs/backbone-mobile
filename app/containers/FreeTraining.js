import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import autobind from 'class-autobind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
// import styles from '../styles/freeTraining';
import styles from '../styles/freeTraining';
import SecondaryText from '../components/SecondaryText';
import List from '../containers/List';

class FreeTraining extends Component {

  constructor() {
    super();
    autobind(this);
    this.db = {
      postureSource: [
        'Standing',
        'Beginner Seated',
        'Intermediate Seated',
        'Advanced Seated',
        'Walking',
        'Running',
        'Infinite',
      ],
      exercisesSource: [
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
      stretchesSource: [
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
    };
  }

  getDataSource(dbSource) {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    return dataSource.cloneWithRowsAndSections(this.convertDataToMap(dbSource));
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

  renderSectionHeader(sectionData, catagory) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>{catagory}</Text>
      </View>
    );
  }

  render() {
    return (
      <ScrollableTabView
        style={styles.container}
        renderTabBar={() => <DefaultTabBar
          style={styles.defaultTabBar}
        />}
        tabBarPosition="top"
        tabBarActiveTextColor="#42a5f5"
        tabBarInactiveTextColor="#bdbdbd"
        tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
        tabBarTextStyle={styles.tabBarTextStyle}
      >
        <ListView
          tabLabel="POSTURE"
          dataSource={this.getDataSource(this.db.postureSource)}
          renderRow={this.renderRow}
          onPressRow={() => {}}
          renderSectionHeader={this.renderSectionHeader}
        />
        <ListView
          tabLabel="EXERCISES"
          dataSource={this.getDataSource(this.db.exercisesSource)}
          renderRow={this.renderRow}
          onPressRow={() => {}}
          renderSectionHeader={this.renderSectionHeader}
        />
        <ListView
          tabLabel="STRETCHES"
          dataSource={this.getDataSource(this.db.stretchesSource)}
          renderRow={this.renderRow}
          onPressRow={() => {}}
          renderSectionHeader={this.renderSectionHeader}
        />
      </ScrollableTabView>
    );
  }
}

export default FreeTraining;
