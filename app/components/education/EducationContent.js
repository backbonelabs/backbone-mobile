import React, { PropTypes } from 'react';
import { View, NativeModules } from 'react-native';
import EducationListItem from './EducationListItem';

const { Environment } = NativeModules;

// Sample titles
// The titles will be used in the url path in order
// to display the webview.
const educationTitles = ['EducationOne', 'EducationTwo'];

const EducationContent = ({ navigator }) => (
  <View>
    {educationTitles.map((title, idx) => {
      const uri = `${Environment.WEB_SERVER_URL}/mobile/education/${title}`;
      return (
        <EducationListItem
          key={idx}
          title={title}
          uri={uri}
          navigator={navigator}
        />
      );
    })}
  </View>
);

EducationContent.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default EducationContent;
