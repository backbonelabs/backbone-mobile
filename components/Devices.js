import React, { Component } from 'react';
import Main from './Main';

import {
  View,
  Text,
  ListView,
  NativeModules,
  TouchableHighlight,
  NativeAppEventEmitter,
} from 'react-native';

const DeviceManagementService = NativeModules.DeviceManagementService;

const styles = {
  container: {
    marginTop: 50,
  },
  title: {
    fontSize: 42,
    marginBottom: 25,
    color: '#A8A8A8',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  listItem: {
    padding: 10,
    borderWidth: 3,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    borderColor: '#48BBEC',
  },
};

class Devices extends Component {

  constructor() {
    super();
    this.ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource: this.ds.cloneWithRows([]),
    };

    this.listenToDevices = NativeAppEventEmitter.addListener('Devices', (deviceList) => {
      console.log('Devices List: ', deviceList);
      this.setState({
        dataSource: this.ds.cloneWithRows(deviceList),
      });
    });

    this.pressRow = this.pressRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  pressRow(deviceID) {
    DeviceManagementService.selectDevice(deviceID, (error) => {
      if (error) {
        console.log('Error: ', error);
      } else {
        this.props.navigator.push({
          name: 'main',
          component: Main,
        });
      }
    });
  }

  renderRow(data) {
    return (
      <TouchableHighlight onPress={() => this.pressRow(data.identifier)}>
        <View style={styles.listItem}>
          <Text>Name: {data.name}</Text>
          <Text>Distance: {data.RSSI}</Text>
        </View>
      </TouchableHighlight>
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

Devices.propTypes = {
  navigator: React.PropTypes.object,
};

export default Devices;
