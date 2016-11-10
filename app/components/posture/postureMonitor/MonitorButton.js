import React, { PropTypes } from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
// import SvgUri from 'react-native-svg-uri';  switch to svg at after library is updated
import pauseImg from '../../../images/monitor/pauseButton.png';
import pauseActiveImg from '../../../images/monitor/pauseButtonActive.png';
import stopImg from '../../../images/monitor/stopButton.png';
import stopActiveImg from '../../../images/monitor/stopButtonActive.png';
import playImg from '../../../images/monitor/playButton.png';
import alertsImg from '../../../images/monitor/alertsButton.png';
import alertsDisabledImg from '../../../images/monitor/alertsButtonDisabled.png';
import styles from '../../../styles/posture/postureMonitor';
import BodyText from '../../BodyText';

const MonitorButton = (props) => {
  const {
    play,
    pauseActive,
    pause,
    stop,
    stopActive,
    alerts,
    alertsDisabled,
    ...otherProps,
  } = props;

  let image;
  let text;
  if (play) { image = playImg; text = 'Play'; }
  if (pause) { image = pauseImg; text = 'Pause'; }
  if (pauseActive) { image = pauseActiveImg; text = 'Pause'; }
  if (stop) { image = stopImg; text = 'Stop'; }
  if (stopActive) { image = stopActiveImg; text = 'Stop'; }
  if (alerts) { image = alertsImg; text = 'Alerts'; }
  if (alertsDisabled) { image = alertsDisabledImg; text = 'Alerts'; }

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.4}
        {...otherProps}
      >
        <Image style={styles.monitorBtn} source={image} />
      </TouchableOpacity>
      <BodyText style={styles._btnText}>{text}</BodyText>
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
