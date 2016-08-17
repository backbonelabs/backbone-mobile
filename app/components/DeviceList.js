import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/deviceList';

export default class DeviceList extends Component {
  static propTypes = {
    modal: React.PropTypes.bool,
    devices: React.PropTypes.array,
    select: React.PropTypes.func,
    rescan: React.PropTypes.func,
  };

  constructor(props) {
    super();
    this.ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource: this.ds.cloneWithRows(props.devices),
    };

    this.pressRow = this.pressRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.devices) !== JSON.stringify(this.props.devices)) {
      this.setState({
        dataSource: this.ds.cloneWithRows(nextProps.devices),
      });
    }
  }

  pressRow(deviceIdentifier) {
    this.props.select(deviceIdentifier);
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
        { this.props.modal ?
          <View /> :
          (<View style={styles.footer}>
            <View style={styles.rescanButton}>
              <TouchableOpacity style={styles.button} onPress={this.props.rescan}>
                <Text style={styles.rescan}>Rescan</Text>
              </TouchableOpacity>
            </View>
          </View>)
        }
      </View>
    );
  }
}
