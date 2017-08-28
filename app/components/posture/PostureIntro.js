import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { View, Image } from 'react-native';
import Button from '../Button';
import HeadingText from '../HeadingText';
import postureActions from '../../actions/posture';
import femaleSitting from '../../images/posture/female-sitting.gif';
import routes from '../../routes';
import styles from '../../styles/posture/postureIntro';

const PostureIntro = ({ duration, navigator, onProceed, setSessionTime }) => {
  // Set posture session duration in Redux store
  setSessionTime(duration);
  return (
    <View style={styles.container}>
      <HeadingText size={3}>Sit or stand up straight before you begin</HeadingText>
      <Image source={femaleSitting} style={styles.image} />
      <Button text="START" primary onPress={() => onProceed(navigator)} />
    </View>
  );
};

PostureIntro.propTypes = {
  duration: PropTypes.number.isRequired,
  navigator: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  onProceed: PropTypes.func,
  setSessionTime: PropTypes.func.isRequired,
};

PostureIntro.defaultProps = {
  onProceed: (navigator) => {
    navigator.push(routes.postureCalibrate);
  },
};

export default connect(null, postureActions)(PostureIntro);
