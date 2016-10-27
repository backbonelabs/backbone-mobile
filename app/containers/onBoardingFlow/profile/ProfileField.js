import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { map, uniqueId } from 'lodash';
import styles from '../../../styles/onBoarding/profile';

const { PropTypes } = React;

const ProfileField = props => {
  const { height, weight, birthdate: b } = props;
  const dateString = `${b.getMonth() + 1}-${b.getDate()}-${b.getFullYear()}`;
  const formattedProfile = { birthdate: dateString, height, weight };

  return (
    <View style={styles.profileInfoContainer}>
      { map(formattedProfile, (value, key) => (
        <TouchableOpacity
          key={`${value}-${uniqueId()}`}
          style={styles.profileInfoField}
          onPress={() => props.setPickerType(key)}
        >
          <Text style={{ marginLeft: 15 }}>
            {`${key.charAt(0).toUpperCase()}${key.slice(1)}`}
          </Text>
          <Text style={{ marginRight: 15 }}>{value}</Text>
        </TouchableOpacity>
      )) }
    </View>
  );
};

ProfileField.propTypes = {
  setPickerType: PropTypes.func,
  pickerType: PropTypes.string,
  birthdate: PropTypes.object,
  weight: PropTypes.string,
  weightMetric: PropTypes.string,
  height: PropTypes.string,
  heightMetric: PropTypes.string,
};

export default ProfileField;
