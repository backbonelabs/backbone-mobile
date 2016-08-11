import React, { Component } from 'react';
import Posture from './Posture';
import {
  View,
  Text,
  ListView,
  NativeModules,
  TouchableHighlight,
  NativeAppEventEmitter,
} from 'react-native';
import styles from '../styles/devices';

const DeviceManagementService = NativeModules.DeviceManagementService;

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

  componentWillUnmount() {
    this.listenToDevices.remove();
  }

  pressRow(deviceID) {
    DeviceManagementService.selectDevice(deviceID, (error) => {
      if (error) {
        console.log('Error: ', error);
      } else {
        this.props.navigator.push({
          name: 'posture',
          component: Posture,
        });
      }
    });
  }

  renderRow(data) {
    return (
      <TouchableHighlight onPress={() => this.pressRow(data.identifier)}>
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>Name: {data.name}</Text>
          <Text style={styles.listItemText}>Distance: {data.RSSI}</Text>
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
