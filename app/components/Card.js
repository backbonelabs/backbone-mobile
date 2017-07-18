import React, { PropTypes } from 'react';
import { View } from 'react-native';
import styles from '../styles/card';

const Card = props => (
  <View
    style={[styles.card, props.style]}
    elevation={2} /* Android 5.0+ only */
  >
    {props.children}
  </View>
);

Card.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export default Card;
