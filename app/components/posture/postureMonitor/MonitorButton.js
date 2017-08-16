import React, { PropTypes } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, View } from 'react-native';
import styles from '../../../styles/posture/postureMonitor';
import BodyText from '../../BodyText';
import theme from '../../../styles/theme';

const MonitorButton = ({ play, pause, stop, alerts, ...otherProps }) => {
  const pauseBgColor = pause ? theme.lightBlueColor : 'white';
  const pauseTextColor = pause ? theme.lightBlueColor : theme.secondaryFontColor;
  let name = '';
  let iconColor = theme.lightBlueColor;
  let text = '';

  if (play) { name = 'play-arrow'; text = 'Play'; }
  if (pause) { name = 'pause'; text = 'Pause'; iconColor = 'white'; }
  if (stop) { name = 'stop'; text = 'Stop'; }
  if (alerts) { name = 'notifications'; text = 'Alerts'; }
  if (otherProps.disabled) { iconColor = theme.disabledColor; }

  return (
    <View>
      <TouchableOpacity
        style={[styles.monitorBtn, { backgroundColor: pauseBgColor }]}
        activeOpacity={0.8}
        onPress={this.handleOnPress}
        {...otherProps}
      >
        <MaterialIcons
          name={name}
          size={40}
          color={iconColor}
        />
      </TouchableOpacity>
      <BodyText style={[styles._btnText, { color: pauseTextColor }]}>{text}</BodyText>
    </View>
    );
};

MonitorButton.propTypes = {
  play: PropTypes.bool,
  pause: PropTypes.bool,
  stop: PropTypes.bool,
  alerts: PropTypes.bool,
};

export default MonitorButton;
