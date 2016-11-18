import React, { Component } from 'react';

import {
  View,
  Text,
  Alert,
  ScrollView,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MKButton } from 'react-native-material-kit';
import List from '../List';
import Spinner from '../../components/Spinner';
import styles from '../../styles/device';
import routes from '../../routes';

const { PropTypes } = React;
const { DeviceManagementService } = NativeModules;

const SelectButton = MKButton.coloredFab()
  .withBackgroundColor('#ED1C24')
  .withStyle({
    height: 30,
    width: 30,
  })
  .build();

class DeviceScan extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
    }),
  };


  constructor() {
    super();
    this.state = {
      deviceList: [],
      inProgress: false,
    };
    this.selectDevice = this.selectDevice.bind(this);
  }

  // Begin scanning for hardware devices in the vicinity
  componentWillMount() {
    // Native module listener will constantly update deviceList
    // NativeAppEventEmitter.addListener('DevicesFound', deviceList => this.setState({ deviceList }));

    // DeviceManagementService.scanForDevices(error => {
    //   if (error) {
    //     Alert.alert('Error', 'Unable to scan for devices', [{
    //       text: 'Try Again',
    //     }]);
    //   } else {
    //     this.setState({ inProgress: true });
    //   }
    // });
  }

  componentWillUnmount() {
    NativeAppEventEmitter.removeAllListeners('DevicesFound');

    // Stop device scanning in case a scan is in progress
    DeviceManagementService.stopScanForDevices();
  }

  // Saves the selected device and attempts to connect to it
  selectDevice(deviceData) {
    DeviceManagementService.selectDevice(deviceData.identifier, (error) => {
      if (error) {
        // Do something about the select device error
      } else {
        // Navigate to DeviceConnect where it'll attempt to connect
        this.props.navigator.replace(routes.deviceConnect);
      }
    });
  }

  // Formats row data and displays it in a component
  formatDeviceRow(rowData) {
    // Pressing on a row will select device and attempt connect
    return (
      <View style={styles.cardStyle}>
        <View style={{ flexDirection: 'column' }}>
          <Text style={[styles.cardContentStyle, { color: 'black', fontSize: 16 }]}>
            Backbone
          </Text>
          <Text style={[styles.cardContentStyle, { marginTop: 3 }]}>
            Unique ID: d2f12936-a749-4da3-941c
          </Text>
        </View>
        <SelectButton>
          <Icon name="keyboard-arrow-right" size={15} color="white" />
        </SelectButton>
      </View>
    );
  }

  render() {
    return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cardStyle}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.cardContentStyle, { color: 'black', fontSize: 16 }]}>
              Backbone
            </Text>
            <Text style={[styles.cardContentStyle, { marginTop: 3 }]}>
              Unique ID: d2f12936-a749-4da3-941c
            </Text>
          </View>
          <SelectButton>
            <Icon name="keyboard-arrow-right" size={15} color="white" />
          </SelectButton>
        </View>
        <View style={styles.cardStyle}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.cardContentStyle, { color: 'black', fontSize: 16 }]}>
              Backbone
            </Text>
            <Text style={[styles.cardContentStyle, { marginTop: 3 }]}>
              Unique ID: d2f12936-a749-4da3-941c
            </Text>
          </View>
          <SelectButton>
            <Icon name="keyboard-arrow-right" size={15} color="white" />
          </SelectButton>
        </View>
        <View style={styles.cardStyle}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.cardContentStyle, { color: 'black', fontSize: 16 }]}>
              Backbone
            </Text>
            <Text style={[styles.cardContentStyle, { marginTop: 3 }]}>
              Unique ID: d2f12936-a749-4da3-941c
            </Text>
          </View>
          <SelectButton>
            <Icon name="keyboard-arrow-right" size={15} color="white" />
          </SelectButton>
        </View>
      </ScrollView>
      // <View style={styles.container}>
      //   { this.state.inProgress && <Spinner /> }
      //   <List
      //     dataBlob={this.state.deviceList}
      //     formatRowData={this.formatDeviceRow}
      //     onPressRow={this.selectDevice}
      //   />
      // </View>
    );
  }
}

export default DeviceScan;
