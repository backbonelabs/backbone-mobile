import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import styles from '../styles/errors';

const Errors = (props) => {
  const { currentRoute } = props;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon size={150} name={currentRoute.iconName.header} color="black" />
      </View>
      <View style={styles.body}>
        <Text style={styles.errorMessage}>
          {currentRoute.error.message}
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={currentRoute.onPress.primary}>
          <Text style={styles.primaryText}>{currentRoute.onPressText.primary}</Text>
        </TouchableOpacity>
      { currentRoute.onPressText.secondary &&
        <TouchableOpacity style={styles.secondaryButton} onPress={currentRoute.onPress.secondary}>
          <Icon size={20} name={currentRoute.iconName.footer} color="black" />
          <Text style={styles.secondaryText}>{currentRoute.onPressText.secondary}</Text>
        </TouchableOpacity>
      }
      </View>
    </View>
  );
};

const { PropTypes } = React;

Errors.propTypes = {
  currentRoute: PropTypes.shape({
    error: PropTypes.object,
    iconName: PropTypes.object,
    onPress: PropTypes.object,
    onPressText: PropTypes.object,
  }),
  error: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
  }),
  iconName: PropTypes.shape({
    header: PropTypes.string,
    footer: PropTypes.string,
  }),
  onPress: PropTypes.shape({
    primary: PropTypes.func,
    secondary: PropTypes.func,
  }),
  onPressText: PropTypes.shape({
    primary: PropTypes.string,
    secondary: PropTypes.string,
  }),
};

export default Errors;
