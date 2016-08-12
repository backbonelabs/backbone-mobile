import React, { Component } from 'react';
import {
  TouchableHighlight,
  Text,
  ListView,
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
      dataSource: ds.cloneWithRows(this.props.settingItems),
    });
  }

  render() {
    return (
      <ListView
        style={styles.list}
        dataSource={this.state.dataSource}
        renderRow={(rowData) => (
          <TouchableHighlight style={styles.listItem} onPress={() => this.props.navigate(rowData)}>
            <Text style={styles.listItemText}>{rowData.title}</Text>
          </TouchableHighlight>
        )}
      />
    );
  }
}
