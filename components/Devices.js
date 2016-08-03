import React, { Component } from 'react';

import {
  View,
  Text,
  ListView,
  NativeAppEventEmitter,
} from 'react-native';

const styles = {
  container: {
    marginTop: 100,
  },
  title: {
    fontSize: 42,
    marginBottom: 20,
    color: '#A8A8A8',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  listItem: {
    padding: 10,
    borderWidth: 2,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    borderColor: 'black',
  },
};

class Devices extends Component {

  constructor() {
    super();
    this.ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource: this.ds.cloneWithRows([]),
    };
    this.renderRow = this.renderRow.bind(this);
    this.listenToDevices = NativeAppEventEmitter.addListener('Devices', (deviceList) => {
      this.setState({
        dataSource: this.ds.cloneWithRows(deviceList),
      });
    });
  }

  renderRow(data) {
    return (
      <View style={styles.listItem}>
        <Text>Name: {data.name}</Text>
        <Text>Distance: {data.RSSI}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>DEVICES</Text>
        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          enableEmptySections
        />
      </View>
    );
  }
}

export default Devices;
