import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import styles from '../styles/banner';
import routes from '../routes';

const Banner = props => {
  const { isConnected, isConnecting, requestingSelfTest } = props;

  if (!isConnected || requestingSelfTest) {
    let bannerText;

    if (isConnecting) {
      bannerText = 'Connecting...';
    } else if (requestingSelfTest) {
      bannerText = 'Fixing BACKBONE sensor...';
    } else {
      bannerText = 'BACKBONE not connected';
    }

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => !isConnecting && props.navigator.push(routes.deviceScan)}
      >
        { isConnecting || requestingSelfTest ?
          <View><Spinner size="small" /></View>
          :
            <Icon
              name="error"
              style={styles.icon}
            />
        }
        <BodyText style={styles.text}>{bannerText}</BodyText>
      </TouchableOpacity>
    );
  }
  return null;
};

const { PropTypes } = React;

Banner.propTypes = {
  isConnected: PropTypes.bool,
  isConnecting: PropTypes.bool,
  requestingSelfTest: PropTypes.bool,
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(Banner);
