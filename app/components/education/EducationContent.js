import React, { PropTypes } from 'react';
import { View, Text } from 'react-native';
import routes from '../../routes';

// Sample titles
// The titles will be used in the url path in order
// to display the webview.
const educationTitles = ['EducationOne', 'EducationTwo'];

const EducationContent = props => (
  <View>
    {educationTitles.map((title, idx) => (
      <Text
        style={{
          textAlign: 'center',
          backgroundColor: '#eee',
          marginBottom: 2,
          padding: 10,
        }}
        key={idx}
        onPress={() =>
          props.navigator.push({
            ...routes.educationWebView,
            props: {
              title,
            },
          })}
      >
        {title}
      </Text>
    ))}
  </View>
);

EducationContent.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default EducationContent;
