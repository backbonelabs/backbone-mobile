import React, { PropTypes } from 'react';
import { View } from 'react-native';
import BodyText from '../BodyText';
import routes from '../../routes';
import styles from '../../styles/education/educationContent';

const EducationListItem = ({ title, uri, navigator }) => {
  const handleOnPress = () =>
    navigator.push({
      ...routes.educationWebView,
      title,
      props: {
        uri,
      },
    });
  return (
    <View style={styles.titleList}>
      <BodyText onPress={handleOnPress}>
        {title}
      </BodyText>
    </View>
  );
};

EducationListItem.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
  title: PropTypes.string,
  uri: PropTypes.string,
};

export default EducationListItem;
