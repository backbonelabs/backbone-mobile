import React, { PropTypes } from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';
// import SvgUri from 'react-native-svg-uri';  switch to svg at after library is updated
import pauseImg from '../../../images/monitor/pauseButton.png';
import pauseActiveImg from '../../../images/monitor/pauseButtonActive.png';
import stopImg from '../../../images/monitor/stopButton.png';
import stopActiveImg from '../../../images/monitor/stopButtonActive.png';
import playImg from '../../../images/monitor/playButton.png';
import alertsImg from '../../../images/monitor/alertsButton.png';
import alertsDisabledImg from '../../../images/monitor/alertsButtonDisabled.png';
import styles from '../../../styles/posture/postureMonitor';

const MonitorButton = (props) => {
  let image;
  let text;
  if (props.play) { image = playImg; text = 'Play'; }
  if (props.pause) { image = pauseImg; text = 'Pause'; }
  if (props.pauseActive) { image = pauseActiveImg; text = 'Pause'; }
  if (props.stop) { image = stopImg; text = 'Stop'; }
  if (props.stopActive) { image = stopActiveImg; text = 'Stop'; }
  if (props.alerts) { image = alertsImg; text = 'Alerts'; }
  if (props.alertsDisabled) { image = alertsDisabledImg; text = 'Alerts'; }

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.5}
        {...props}
      >
        <Image style={styles.monitorBtn} source={image} />
      </TouchableOpacity>
      <Text style={styles.btnText}>{text}</Text>
    </View>
  );
};

MonitorButton.propTypes = {
  play: PropTypes.bool,
  playActive: PropTypes.bool,
  pause: PropTypes.bool,
  pauseActive: PropTypes.bool,
  stop: PropTypes.bool,
  stopActive: PropTypes.bool,
  alerts: PropTypes.bool,
  alertsDisabled: PropTypes.bool,
};

export default MonitorButton;
