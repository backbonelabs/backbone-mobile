import React from 'react';
import { ActivityIndicator } from 'react-native';
import styles from '../styles/spinner';

const Spinner = props => <ActivityIndicator color={styles._spinner.color} {...props} />;

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
