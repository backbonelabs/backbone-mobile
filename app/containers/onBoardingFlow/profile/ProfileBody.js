import React, { PropTypes } from 'react';
import { View } from 'react-native';
import constants from '../../../utils/constants';
import birthdayIconOff from '../../../images/onboarding/birthday-icon-off.png';
import birthdayIcon from '../../../images/onboarding/birthday-icon-on.png';
import heightIconOff from '../../../images/onboarding/height-icon-off.png';
import heightIcon from '../../../images/onboarding/height-icon-on.png';
import weightIconOff from '../../../images/onboarding/weight-icon-off.png';
import weightIcon from '../../../images/onboarding/weight-icon-on.png';
import ProfileField from './ProfileField';
import theme from '../../../styles/theme';

const ProfileBody = (props) => {
  const {
    height,
    weight,
    birthdate,
  } = props;

  const dateString = birthdate ?
    `${constants.months[birthdate.getMonth()]} ${birthdate.getDate()}, ${birthdate.getFullYear()}`
    :
    '';

  const formattedProfile = [
      { type: 'birthdate', label: dateString, icon: birthdayIcon, iconOff: birthdayIconOff },
      { type: 'height', label: height.label, icon: heightIcon, iconOff: heightIconOff },
      { type: 'weight', label: weight.label, icon: weightIcon, iconOff: weightIconOff },
  ];

  return (
    <View>
      {
        formattedProfile.map((val) => (
          <ProfileField
            styles={{
              borderWidth: val.type === props.currentPickerType ? 1 : 0,
              borderColor: val.type === props.currentPickerType ?
              theme.secondaryColor : 'transparent',
            }}
            value={val}
            key={val.type}
            setPickerType={props.setPickerType}
            icon={val.type === props.currentPickerType ? val.icon : val.iconOff}
          />
        ))
      }
    </View>
    );
};

ProfileBody.propTypes = {
  setPickerType: PropTypes.func,
  currentPickerType: PropTypes.string,
  birthdate: PropTypes.object,
  height: PropTypes.object,
  weight: PropTypes.object,
};

export default ProfileBody;
