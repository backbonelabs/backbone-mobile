import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import routes from '../../routes';
import DeviceScan from '../../containers/device/DeviceScan';
import BodyText from '../../components/BodyText';
import Mixpanel from '../../utils/Mixpanel';

const DeviceScanSkipButton = props => (
  <TouchableOpacity
    style={{ padding: 5 }}
    onPress={() => {
      Mixpanel.track('skipScanForDevices');
    // Loop through routeStack starting with the most recent route
      const routeStack = props.navigator.getCurrentRoutes().reverse();

      for (let i = 0; i < routeStack.length; i++) {
        // if onboarding is in the stack, use pop() to redirect
        if (routeStack[i].name === 'onboarding') {
          return props.navigator.pop();
        }
      }

    // Else redirect to dashboard
      return props.navigator.replace(routes.postureDashboard);
    }}
  >
    <BodyText style={{ color: '#FFFFFF' }}>Skip</BodyText>
  </TouchableOpacity>
);

DeviceScanSkipButton.propTypes = {
  navigator: PropTypes.shape({
    pop: PropTypes.func,
    replace: PropTypes.func,
    getCurrentRoutes: PropTypes.func,
  }),
};

export default {
  name: 'deviceScan',
  title: 'Device Scan',
  component: DeviceScan,
  rightComponent: connect()(DeviceScanSkipButton),
};
