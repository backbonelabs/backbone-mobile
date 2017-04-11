import React, { PropTypes } from 'react';
import { WebView } from 'react-native';

const EducationWebView = ({ uri }) => <WebView source={{ uri }} />;

EducationWebView.propTypes = {
  uri: PropTypes.string.isRequired,
};

export default EducationWebView;
