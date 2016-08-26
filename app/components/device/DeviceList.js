import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import styles from '../../styles/device/deviceList';

export default class DeviceList extends Component {
  static propTypes = {
    deviceList: React.PropTypes.array,
    selectDevice: React.PropTypes.func,
    rescanForDevices: React.PropTypes.func,
    inProgress: React.PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource: this.ds.cloneWithRows(this.props.deviceList),
    };

    this.pressRow = this.pressRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.deviceList) !== JSON.stringify(this.props.deviceList)) {
      this.setState({ dataSource: this.ds.cloneWithRows(nextProps.deviceList) });
    }
  }

  pressRow(deviceIdentifier) {
    this.props.selectDevice(deviceIdentifier);
  }

  renderRow(data) {
    return (
      <TouchableOpacity onPress={() => this.pressRow(data.identifier)}>
        <View style={styles.deviceContainer}>
          <Text style={styles.deviceName}>{data.name}</Text>
          <Text style={styles.deviceID}>ID: {data.identifier}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Devices</Text>
        </View>
        <View style={styles.body}>
          <ScrollView>
            <ListView
              dataSource={this.state.dataSource}
              renderRow={this.renderRow}
              enableEmptySections
            />
          </ScrollView>
        </View>
        { this.props.inProgress ?
          <View /> :
          (<View style={styles.footer}>
            <View style={styles.rescanButton}>
              <TouchableOpacity style={styles.button} onPress={this.props.rescanForDevices}>
                <Text style={styles.rescanForDevices}>Rescan</Text>
              </TouchableOpacity>
            </View>
          </View>)
        }
      </View>
    );
  }
}
