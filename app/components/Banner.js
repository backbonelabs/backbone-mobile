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

const Banner = props => {
  const { isConnected, inProgress } = props;

  if (!isConnected) {
    const bannerText = inProgress ? 'Connecting...' : 'Backbone not connected';
    return (
      <TouchableOpacity
        style={styles.banner}
        onPress={() => !inProgress && props.navigator.push(routes.deviceConnect)}
      >
        { inProgress ?
          <View><Spinner size="small" /></View>
          :
            <Icon
              name="error"
              size={styles.$bannerIconSize}
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

Banner.propTypes = {
  isConnected: PropTypes.bool,
  inProgress: PropTypes.bool,
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(Banner);
