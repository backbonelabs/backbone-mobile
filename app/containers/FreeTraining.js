import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import autobind from 'class-autobind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/freeTraining';
import SecondaryText from '../components/SecondaryText';
import List from '../containers/List';

class FreeTraining extends Component {

  constructor() {
    super();
    autobind(this);
    this.state = {
      postureSource: [
        'Posture 1',
        'Posture 2',
        'Posture 3',
        'Posture 4',
      ],
      exercisesSource: [
        'Exericse 1',
        'Exericse 2',
        'Exericse 3',
        'Exericse 4',
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

  render() {
    return (
      <ScrollableTabView
        style={styles.container}
        renderTabBar={() => <DefaultTabBar
          style={styles.defaultTabBar}
        />}
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
        <List
          tabLabel="EXERCISES"
          dataBlob={this.state.exercisesSource}
          formatRowData={this.formatItemRow}
          onPressRow={() => {}}
        />
        <List
          tabLabel="STRETCHES"
          dataBlob={this.state.stretchesSource}
          formatRowData={this.formatItemRow}
          onPressRow={() => {}}
        />
      </ScrollableTabView>
    );
  }
}

export default FreeTraining;
