import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import { map, uniqueId } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../../../styles/onBoarding/profile';
import BodyText from '../../../components/BodyText';
import SecondaryText from '../../../components/SecondaryText';

const { PropTypes } = React;
const monthList = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ProfileField = props => {
  const { height, weight, birthdate: b } = props;
  const dateString = b ? `${monthList[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}` : '';
  const formattedProfile = { birthdate: dateString, height: height.value, weight: weight.value };

  return (
    <View style={styles.profileFieldContainer}>
      { map(formattedProfile, (value, key) => (
        <TouchableOpacity
          key={`profileFieldKey-${uniqueId()}`}
          style={styles.profileField}
          onPress={() => props.setPickerType(key)}
        >
          { value ?
            <View style={styles.completedProfileField}>
              <BodyText>{ value }</BodyText>
              <Icon
                name={'check'}
                color={styles._profileFieldIcon.color}
                size={16}
              />
            </View>
          :
            <SecondaryText>{`${key.charAt(0).toUpperCase()}${key.slice(1)}`}</SecondaryText>
          }
        </TouchableOpacity>
      )) }
    </View>
    );
};

ProfileField.propTypes = {
  setPickerType: PropTypes.func,
  birthdate: PropTypes.object,
  weight: PropTypes.object,
  height: PropTypes.object,
};

export default ProfileField;
