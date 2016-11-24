import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Spinner from '../components/Spinner';
import SecondaryText from '../components/SecondaryText';
import styles from '../styles/banner';
import theme from '../styles/theme';
import routes from '../routes';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference } = relativeDimensions;

const ConnectBanner = props => {
  const { isConnected, inProgress } = props.device;

  if (!isConnected) {
    const bannerText = inProgress ? 'Connecting...' : 'Backbone not connected';
    return (
      <TouchableOpacity
        style={styles.banner}
        onPress={() => !inProgress && this.navigator.push(routes.deviceAdd)}
      >
        { inProgress ?
          <View><Spinner size="small" /></View>
          :
            <Icon
              name="error"
              size={16 * widthDifference}
              color={theme.primaryColor}
            />
        }
        <SecondaryText style={styles._bannerText}>{bannerText}</SecondaryText>
      </TouchableOpacity>
    );
  }
  return null;
};

const { PropTypes } = React;

ConnectBanner.propTypes = {
  device: PropTypes.shape({
    isConnected: PropTypes.bool,
    inProgress: PropTypes.bool,
  }),
};

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(ConnectBanner);
