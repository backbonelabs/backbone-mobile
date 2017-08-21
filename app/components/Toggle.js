import React, { PropTypes } from 'react';
import {
  View,
  Switch,
} from 'react-native';
import styles from '../styles/toggle';
import BodyText from '../components/BodyText';

const Toggle = props => (
  <View style={styles.toggleContainer}>
    <View style={styles.toggleText}>
      <BodyText>{props.text}</BodyText>
    </View>
    <View style={styles.toggleSwitch}>
      <Switch
        disabled={props.disabled}
        value={props.value}
        onValueChange={value => props.onChange(props.settingName, value)}
      />
    </View>
  </View>
);

Toggle.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  text: PropTypes.string.isRequired,
  settingName: PropTypes.string.isRequired,
};

export default Toggle;
