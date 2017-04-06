import React, { PropTypes } from 'react';
import { WebView, NativeModules } from 'react-native';

const { Environment } = NativeModules;

const EducationWebView = ({ title }) => (
  <WebView
    source={{ uri: `${Environment.WEB_SERVER_URL}/education/${title}` }}
  />
);

EducationWebView.propTypes = {
  title: PropTypes.string.isRequired,
};

export default EducationWebView;
