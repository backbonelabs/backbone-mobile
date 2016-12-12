import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import BodyText from './BodyText';
import SecondaryText from './SecondaryText';

import styles from '../styles/errors';

const Errors = (props) => {
  const { currentRoute } = props;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon size={150} name={currentRoute.iconName.header} color="black" />
      </View>
      <View style={styles.body}>
        <BodyText style={styles.errorMessage}>{currentRoute.errorMessage}</BodyText>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={currentRoute.onPress.primary}>
          <BodyText style={styles.primaryText}>{currentRoute.onPressText.primary}</BodyText>
        </TouchableOpacity>
        { currentRoute.onPressText.secondary &&
          <TouchableOpacity style={styles.secondaryButton} onPress={currentRoute.onPress.secondary}>
            <Icon size={20} name={currentRoute.iconName.footer} color="black" />
            <SecondaryText style={styles.secondaryText}>
              {currentRoute.onPressText.secondary}
            </SecondaryText>
          </TouchableOpacity>
        }
      </View>
    </View>
  );
};

const { PropTypes } = React;

Errors.propTypes = {
  currentRoute: PropTypes.shape({
    errorMessage: PropTypes.string,
    iconName: PropTypes.object,
    onPress: PropTypes.object,
    onPressText: PropTypes.object,
  }),
  errorMessage: PropTypes.string,
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
