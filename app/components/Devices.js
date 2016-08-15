import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  ListView,
  NativeModules,
  ActivityIndicator,
  TouchableHighlight,
  NativeAppEventEmitter,
} from 'react-native';
import postureRoute from '../routes/posture';
import styles from '../styles/devices';

const DeviceManagementService = NativeModules.DeviceManagementService;

class Devices extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor() {
    super();
    this.ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      connecting: false,
      dataSource: this.ds.cloneWithRows([]),
    };

    this.listenToDevices = NativeAppEventEmitter.addListener('Devices', (deviceList) => {
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
    this.setState({
      connecting: true,
    }, () => {
      DeviceManagementService.selectDevice(deviceID, (error) => {
        if (error) {
          this.handleConnectError(error);
        } else {
          this.props.navigator.push(postureRoute);
        }
      });
    });
  }

  handleConnectError(error) {
    this.setState({
      connecting: false,
    }, () => {
      Alert.alert(
        'Error!',
        error.message,
        [
          { text: 'Try Again' },
        ]);
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
        <Text style={styles.title}>{this.props.currentRoute.title}</Text>
        {this.state.connecting ?
          <ActivityIndicator
            animating
            color="gray"
            size="large"
          /> :
          <ListView
            style={styles.list}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            enableEmptySections
          />
        }
      </View>
    );
  }
}

export default Devices;
