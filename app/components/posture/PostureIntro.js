import React, { PropTypes } from 'react';
import { View, Image } from 'react-native';
import Button from '../Button';
import HeadingText from '../HeadingText';
import femaleSitting from '../../images/posture/female-sitting.gif';
import styles from '../../styles/posture/postureIntro';

const PostureIntro = ({ onProceed }) => (
  <View style={styles.container}>
    <HeadingText size={3}>Sit or stand up straight before you begin</HeadingText>
    <Image source={femaleSitting} style={styles.image} />
    <Button text="START" primary onPress={onProceed} />
  </View>
);

PostureIntro.propTypes = {
  onProceed: PropTypes.func,
};

PostureIntro.defaultProps = {
  onProceed: () => {},
};

export default PostureIntro;
