import React from 'react';
import UnscalableText from './UnscalableText';
import styles from '../styles/text';

const SecondaryText = props => {
  const {
    style,
    ...remainingProps,
  } = props;

  return (
    <UnscalableText style={[styles.secondary, style]} {...remainingProps}>
      {props.children}
    </UnscalableText>
  );
};

SecondaryText.propTypes = UnscalableText.propTypes;

export default SecondaryText;
