import React from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import styles from '../styles/spinner';

const Spinner = props => (
  <View style={styles.container}>
    <ActivityIndicator color={styles._spinner.color} {...props} />
  </View>
);

const { PropTypes } = React;
Spinner.propTypes = {
  animating: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'large']),
};

Spinner.defaultProps = {
  animating: true,
  size: 'large',
};

export default Spinner;
