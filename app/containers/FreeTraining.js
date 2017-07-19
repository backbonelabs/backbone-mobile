import React, { Component } from 'react';
import {
  View,
  ListView,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import autobind from 'class-autobind';
// import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/freeTraining';
import SecondaryText from '../components/SecondaryText';

class FreeTraining extends Component {

  constructor() {
    super();
    autobind(this);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      postureSource: ds.cloneWithRows([
        'Posture 1',
        'Posture 2',
        'Posture 3',
        'Posture 4',
      ]),
      exercisesSource: ds.cloneWithRows([
        'Exericse 1',
        'Exericse 2',
        'Exericse 3',
        'Exericse 4',
      ]),
      stretchesSource: ds.cloneWithRows([
        'Stretch 1',
        'Stretch 2',
        'Stretch 3',
        'Stretch 4',
      ]),
    };
  }

  render() {
    return (
      <ScrollableTabView
        style={styles.container}
        renderTabBar={() => <DefaultTabBar
          style={styles.defaultTabBar}
        />}
        tabBarActiveTextColor={'#42a5f5'}
        tabBarInactiveTextColor={'#bdbdbd'}
        tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
        tabBarTextStyle={styles.tabBarTextStyle}
      >
        <ListView
          tabLabel={'POSTURE'}
          dataSource={this.state.postureSource}
          renderRow={rowData =>
            <View style={styles.listContainer}>
              <View style={styles.listInnerContainer}>
                <View style={styles.videoBox} />
                <SecondaryText style={styles._listText}>{rowData}</SecondaryText>
              </View>
              <Icon name={'keyboard-arrow-right'} style={styles._lockIcon} size={30} />
            </View>
          }
        />
        <ListView
          tabLabel={'EXERCISES'}
          dataSource={this.state.exercisesSource}
          renderRow={rowData =>
            <View style={styles.listContainer}>
              <View style={styles.listInnerContainer}>
                <View style={styles.videoBox} />
                <SecondaryText style={styles._listText}>{rowData}</SecondaryText>
              </View>
              <Icon name={'keyboard-arrow-right'} style={styles._lockIcon} size={30} />
            </View>
          }
        />
        <ListView
          tabLabel={'STRETCHES'}
          dataSource={this.state.stretchesSource}
          renderRow={rowData =>
            <View style={styles.listContainer}>
              <View style={styles.listInnerContainer}>
                <View style={styles.videoBox} />
                <SecondaryText style={styles._listText}>{rowData}</SecondaryText>
              </View>
              <Icon name={'lock'} style={styles._lockIcon} size={30} />
            </View>
          }
        />
      </ScrollableTabView>
    );
  }
}

export default FreeTraining;
