import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { uniqueId } from 'lodash';
import styles from '../../../styles/onBoarding/profile';
import Input from '../../../components/Input';
import SecondaryText from '../../../components/SecondaryText';
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
            key={`genderKey-${uniqueId()}`}
            style={styles.gender}
            onPress={() => props.selectGender(value)}
          >
            <Image source={genderImageMap[value === props.gender ? `${value}Selected` : value]} />
            <SecondaryText style={styles._genderText}>
              { value === props.gender ?
                'Change'
                :
                `${value.charAt(0).toUpperCase()}${value.slice(1)}`
              }
            </SecondaryText>
          </TouchableOpacity>
        );
      }
      return returnedComponent;
    }) }
    { props.gender &&
      <Input
        style={styles._nicknameInput}
        defaultValue={props.nickname}
        placeholder="Nickname"
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="default"
        onChangeText={text => props.updateField('nickname', text)}
        iconFont={props.nickname ? 'FontAwesome' : ''}
        iconRightName={props.nickname ? 'check' : ''}
      />
    }
  </View>
);

ProfileGender.propTypes = {
  gender: PropTypes.string,
  selectGender: PropTypes.func,
  updateField: PropTypes.func,
  nickname: PropTypes.string,
  setPickerType: PropTypes.func,
};

export default ProfileGender;
