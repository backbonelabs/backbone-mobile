import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  ScrollView,
  TouchableHighlight,
} from 'react-native';
import styles from '../styles/deviceList';

export default class DeviceList extends Component {
  static propTypes = {
    devices: React.PropTypes.array,
    selectDevice: React.PropTypes.func,
  };

  constructor(props) {
    super();
    const ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource: ds.cloneWithRows(props.devices),
    };

    this.pressRow = this.pressRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  pressRow(deviceIdentifier) {
    this.props.selectDevice(deviceIdentifier);
  }

  renderRow(data) {
    return (
      <TouchableHighlight onPress={() => this.pressRow(data.identifier)}>
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>Name: {data.name}</Text>
          <Text style={styles.listItemText}>Distance: {data.RSSI}</Text>
          <Text style={styles.listItemText}>Identifier: {data.identifier}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Devices</Text>
        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          enableEmptySections
        />
      </ScrollView>
    );
  }
}
