import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import DeviceScan from '../../containers/device/DeviceScan';
import BodyText from '../../components/BodyText';
import Mixpanel from '../../utils/Mixpanel';

const DeviceScanSkipButton = props => (
  <TouchableOpacity
    style={{ padding: 5 }}
    onPress={() => {
      Mixpanel.track('skipScanForDevices');
      props.navigator.pop();
    }}
  >
    <BodyText style={{ color: '#FFFFFF' }}>Skip</BodyText>
  </TouchableOpacity>
);

DeviceScanSkipButton.propTypes = {
  navigator: PropTypes.shape({
    pop: PropTypes.func,
  }),
};

export default {
  name: 'deviceScan',
  title: 'Device Scan',
  component: DeviceScan,
  rightComponent: connect()(DeviceScanSkipButton),
};
