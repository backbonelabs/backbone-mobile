import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import autobind from 'class-autobind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/freeTraining';
import styles2 from '../styles/freeTraining2';
import SecondaryText from '../components/SecondaryText';
import List from '../containers/List';

class FreeTraining extends Component {

  constructor() {
    super();
    autobind(this);
    this.state = {
      postureSource: [
        'Standing Posture',
        'Seated Posture',
        'Beginner Posture',
        'Intermediate Posture',
        'Advanced Posture',
        'Walking Posure',
      ],
      exercisesSource: [
        'Pushups',
        'Pull ups',
        'Squats',
        'Bench press',
        'Overhead press',
      ],
      stretchesSource: [
        'Stretch 1',
        'Stretch 2',
        'Stretch 3',
        'Stretch 4',
      ],
    };
  }

  formatItemRow(rowData) {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listInnerContainer}>
          <View style={styles.preview} />
          <SecondaryText style={styles._listText}>{rowData}</SecondaryText>
        </View>
        <Icon name="lock" style={styles._icon} size={30} />
      </View>
    );
  }

  formatItemRow2(rowData) {
    return (
      <View style={{ flexDirection: 'column' }}>
        <View style={styles2.listContainer}>
          <View style={styles2.listInnerContainer}>
            <View style={styles2.preview} />
            <SecondaryText style={styles2._listText}>{rowData}</SecondaryText>
          </View>
          <FontAwesomeIcon name="heart" style={styles2._icon} size={25} />
        </View>
        <View style={styles2.barContainer}>
          <View style={styles2.bar} />
        </View>
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
        <List
          tabLabel="POSTURE"
          dataBlob={this.state.postureSource}
          formatRowData={this.formatItemRow}
          onPressRow={() => {}}
        />
        <View tabLabel="EXERCISES">
          <View style={styles2.indexContainer}>
            <Text style={styles2.index}>A</Text>
          </View>
          <List
            dataBlob={this.state.exercisesSource}
            formatRowData={this.formatItemRow2}
            onPressRow={() => {}}
          />
          <View style={styles2.indexContainer}>
            <Text style={styles2.index}>B</Text>
          </View>
          <List
            dataBlob={this.state.exercisesSource}
            formatRowData={this.formatItemRow2}
            onPressRow={() => {}}
          />
        </View>
        <List
          tabLabel="STRETCHES"
          dataBlob={this.state.stretchesSource}
          formatRowData={this.formatItemRow2}
          onPressRow={() => {}}
        />
      </ScrollableTabView>
    );
  }
}

export default FreeTraining;
