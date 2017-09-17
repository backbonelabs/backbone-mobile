import React from 'react';
import { Text } from 'react-native';

const UnscalableText = (props) => (
  <Text
    allowFontScaling={false}
    {...props}
  >
    {props.children}
  </Text>
);

UnscalableText.propTypes = Text.propTypes;

export default UnscalableText;
