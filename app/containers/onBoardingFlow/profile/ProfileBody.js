import React, { PropTypes } from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import { map } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../../../styles/onBoarding/profile';
import BodyText from '../../../components/BodyText';
import SecondaryText from '../../../components/SecondaryText';
import constants from '../../../utils/constants';

const ProfileBody = props => {
  const {
    height,
    weight,
    birthdate,
  } = props;
  const dateString = birthdate ?
    `${constants.months[birthdate.getMonth()]} ${birthdate.getDate()}, ${birthdate.getFullYear()}`
    :
    '';
  const formattedProfile = {
    birthdate: dateString,
    height: height.label,
    weight: weight.label,
  };

  return (
    <View style={styles.profileBodyContainer}>
      { map(formattedProfile, (value, key) => (
        <TouchableOpacity
          key={key}
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

ProfileBody.propTypes = {
  setPickerType: PropTypes.func,
  birthdate: PropTypes.object,
  height: PropTypes.object,
  weight: PropTypes.object,
};

export default ProfileBody;
