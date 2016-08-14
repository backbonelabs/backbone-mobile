import React, { Component } from 'react';
import {
  TouchableHighlight,
  Text,
  ListView,
  View,
} from 'react-native';
import styles from '../styles/setting';

export default class Setting extends Component {
  static propTypes = {
    settingItems: React.PropTypes.object,
    navigate: React.PropTypes.func,
  };

  constructor() {
    super();

    this.state = {
      dataSource: null,
    };
  }

  componentWillMount() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.setState({
      dataSource: ds.cloneWithRows(['setting test1 Page', 'setting test2 Page']),
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          renderRow={(rowData) => (
            <TouchableHighlight
              style={styles.listItem}
              onPress={() => this.props.navigate(rowData)}
            >
              <Text style={styles.listItemText}>{rowData}</Text>
            </TouchableHighlight>
          )}
        />
      </View>
    );
  }
}
