import React, { PropTypes } from 'react';
import { ActivityIndicator } from 'react-native';
import styles from '../styles/spinner';

const Spinner = props => (
  <ActivityIndicator style={styles.spinnerPosition} color={styles._spinner.color} {...props} />
);

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
