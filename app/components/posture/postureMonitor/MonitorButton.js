import React, { PropTypes } from 'react';
import { TouchableOpacity, Image } from 'react-native';
// import SvgUri from 'react-native-svg-uri';  switch to svg at after library is updated
import pauseImg from '../../../images/monitor/pauseButton.png';
import pauseActiveImg from '../../../images/monitor/pauseButtonActive.png';
import stopImg from '../../../images/monitor/stopButton.png';
import stopActiveImg from '../../../images/monitor/stopButtonActive.png';
import playImg from '../../../images/monitor/playButton.png';
import alertsImg from '../../../images/monitor/alertsButton.png';
import alertsDisabledImg from '../../../images/monitor/alertsButtonDisabled.png';

const MonitorButton = (props) => {
  let image;
  if (props.play) { image = playImg; }
  if (props.pause) { image = pauseImg; }
  if (props.pauseActive) { image = pauseActiveImg; }
  if (props.stop) { image = stopImg; }
  if (props.stopActive) { image = stopActiveImg; }
  if (props.alerts) { image = alertsImg; }
  if (props.alertsDisabled) { image = alertsDisabledImg; }

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      {...props}
    >
      <Image style={{ width: 76, height: 75 }} source={image} />
    </TouchableOpacity>
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
