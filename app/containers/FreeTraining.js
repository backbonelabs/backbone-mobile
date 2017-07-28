import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  Animated,
  Alert,
  TouchableHighlight,
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
    this.state = {
      bounceValue: new Animated.Value(100),  // This is the initial position of the subview
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

    let toValue = 100;

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

  renderSectionHeader(sectionData, catagory) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>{catagory}</Text>
      </View>
    );
  }

  render() {
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
        <Animated.View
          style={[styles.subView,
              { transform: [{ translateY: this.state.bounceValue }] }]}
        >
          <Text>CATEGORIZE LIST:</Text>
          <TouchableHighlight onPress={() => { Alert.alert('hi'); }}>
            <Text>ALPHABETICAL ORDER (A-Z)</Text>
          </TouchableHighlight>
          <TouchableHighlight>
            <Text>POPULARITY</Text>
          </TouchableHighlight>
          <TouchableHighlight>
            <Text>EXERCISE</Text>
          </TouchableHighlight>
          <TouchableHighlight>
            <Text>DIFFICULTY</Text>
          </TouchableHighlight>
        </Animated.View>
      </View>
    );
  }
}
export default FreeTraining;
