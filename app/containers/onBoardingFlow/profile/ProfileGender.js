import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { uniqueId } from 'lodash';
import styles from '../../../styles/onBoarding/profile';
import Input from '../../../components/Input';
import maleIcon from '../../../images/profile/male.png';
import maleSelectedIcon from '../../../images/profile/maleSelected.png';
import femaleIcon from '../../../images/profile/female.png';
import femaleSelectedIcon from '../../../images/profile/femaleSelected.png';

const genders = ['female', 'male'];
const genderImageMap = {
  male: maleIcon,
  maleSelected: maleSelectedIcon,
  female: femaleIcon,
  femaleSelected: femaleSelectedIcon,
};

const { PropTypes } = React;

const ProfileGender = props => (
  <View style={styles.genderSelectionContainer}>
    { genders.map(value => {
      let returnedComponent;

      if (props.gender && value !== props.gender) {
        returnedComponent = null;
      } else {
        returnedComponent = (
          <TouchableOpacity
            key={uniqueId()}
            style={styles.gender}
            onPress={() => props.selectGender(value)}
          >
            <Image source={genderImageMap[value === props.gender ? `${value}Selected` : value]} />
            <Text style={styles.genderText}>
              {value}
            </Text>
          </TouchableOpacity>
        );
      }
      return returnedComponent;
    }) }
    { props.gender && <Input defaultValue="" placeholder="Nickname" /> }
  </View>
);

ProfileGender.propTypes = {
  gender: PropTypes.string,
  selectGender: PropTypes.func,
};

export default ProfileGender;
