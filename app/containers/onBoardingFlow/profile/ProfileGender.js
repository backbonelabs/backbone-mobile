import React, { PropTypes } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import constants from '../../../utils/constants';
import styles from '../../../styles/onBoarding/profile';
import Input from '../../../components/Input';
import SecondaryText from '../../../components/SecondaryText';
import maleIcon from '../../../images/onboarding/male.png';
import maleSelectedIcon from '../../../images/onboarding/maleSelected.png';
import femaleIcon from '../../../images/onboarding/female.png';
import femaleSelectedIcon from '../../../images/onboarding/femaleSelected.png';

const { gender } = constants;

const genderIcons = {
  male: maleIcon,
  maleSelected: maleSelectedIcon,
  female: femaleIcon,
  femaleSelected: femaleSelectedIcon,
};

const ProfileGender = props => {
  const inputProps = {};

  if (props.nickname) {
    inputProps.iconFont = 'FontAwesome';
    inputProps.iconRightName = 'check';
  }

  return (
    <View style={styles.genderSelectionContainer}>
      { Object.keys(gender).map((value, key) => {
        let returnedComponent;

        if (props.gender && gender[value] !== props.gender) {
          returnedComponent = null;
        } else {
          returnedComponent = (
            <TouchableOpacity
              key={key}
              style={styles.gender}
              onPress={() => props.updateProfile('gender', props.gender ? null : gender[value])}
            >
              <Image
                style={styles._genderIcon}
                source={genderIcons[(gender[value] === props.gender) ? `${value}Selected` : value]}
              />
              <SecondaryText style={styles._genderText}>
                { gender[value] === props.gender ?
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
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
          onChangeText={text => props.updateProfile('nickname', text)}
          {...inputProps}
        />
      }
    </View>
  );
};

ProfileGender.propTypes = {
  gender: PropTypes.number,
  updateProfile: PropTypes.func,
  nickname: PropTypes.string,
};

export default ProfileGender;