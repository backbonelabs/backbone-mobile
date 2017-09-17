import React, { PropTypes } from 'react';
import UnscalableText from './UnscalableText';
import styles from '../styles/text';

const HeadingText = props => {
  const {
    size,
    style,
    ...remainingProps,
  } = props;

  return (
    <UnscalableText style={[styles[`heading${size}`], style]} {...remainingProps}>
      {props.children}
    </UnscalableText>
  );
};

HeadingText.propTypes = Object.assign({}, UnscalableText.propTypes, {
  size: PropTypes.oneOf([1, 2, 3]).isRequired,
});


export default HeadingText;
