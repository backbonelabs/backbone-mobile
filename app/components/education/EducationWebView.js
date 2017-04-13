import React, { PropTypes } from 'react';
import { WebView } from 'react-native';
import BodyText from '../BodyText';
import Spinner from '../Spinner';

const showSpinner = () => <Spinner />;
const showErrorMessage = () => (
  <BodyText>An error has occur, Please try again later</BodyText>
);

const EducationWebView = ({ uri }) => (
  <WebView
    source={{ uri }}
    startInLoadingState
    renderLoading={showSpinner}
    renderError={showErrorMessage}
  />
);

EducationWebView.propTypes = {
  uri: PropTypes.string.isRequired,
};

export default EducationWebView;
