import React, { Component } from 'react';

import {
  View,
  Text,
  Alert,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import List from '../List';
import deviceActions from '../../actions/device';
import Spinner from '../../components/Spinner';
import styles from '../../styles/deviceScan';
import routes from '../../routes';

const { DeviceManagementService } = NativeModules;

class DeviceScan extends Component {
  static propTypes = {
    navigator: React.PropTypes.shape({
      replace: React.PropTypes.func,
      pop: React.PropTypes.func,
    }),
    deviceList: React.PropTypes.array,
    dispatch: React.PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      deviceList: [],
      inProgress: false,
    };
    this.selectDevice = this.selectDevice.bind(this);
  }

  componentWillMount() {
    this.props.dispatch(deviceActions.scan());
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.inProgress !== nextProps.inProgress) {
      this.setState({ inProgress: nextProps.inProgress });
    }

    if (!this.props.deviceList && nextProps.deviceList) {
      this.setState({ deviceList: nextProps.deviceList });
    }
  }

  selectDevice(deviceData) {
    DeviceManagementService.selectDevice(deviceData.identifier, (error) => {
      if (!error) {
        this.props.navigator.replace(routes.deviceConnect);
      } else {
        Alert.alert('Error', 'Failed to connect!', [{
          text: 'Try Again',
          onPress: () => this.props.dispatch(deviceActions.scan()),
        }]);
      }
    });
  }

  formatDeviceRow(rowData) {
    return (
      <View>
        <Text style={styles.deviceName}>{rowData.name}</Text>
        <Text style={styles.deviceID}>{rowData.identifier}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
      { this.state.inProgress ?
        <View style={styles.spinner}>
          <Spinner style={styles.progress} />
          <Text style={styles.spinnerText}>Scanning</Text>
        </View>
        :
        <List
          dataBlob={this.state.deviceList}
          formatRowData={this.formatDeviceRow}
          onPressRow={this.selectDevice}
        />
      }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(DeviceScan);
