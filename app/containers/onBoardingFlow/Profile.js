import React from 'react';

import {
  View,
} from 'react-native';
import HeadingText from '../../components/HeadingText';
import styles from '../../styles/onBoarding/profile';
import Button from '../../components/Button';
import ProfileGender from './profile/ProfileGender';
import ProfileField from './profile/ProfileField';
import ProfilePicker from './profile/ProfilePicker';

const Profile = props => (
  <View key={props.key} style={styles.container}>
    <View style={styles.textContainer}>
      <HeadingText size={3}>Create Your Profile</HeadingText>
    </View>
    <ProfileGender
      setPickerType={props.setPickerType}
      nickname={props.nickname}
      gender={props.gender}
      selectGender={props.selectGender}
      updateField={props.updateField}
    />
    <ProfileField
      setPickerType={props.setPickerType}
      birthdate={props.birthdate}
      height={props.height}
      weight={props.weight}
    />
    { props.pickerType ?
      <ProfilePicker
        birthdate={props.birthdate}
        height={props.height}
        weight={props.weight}
        setPickerType={props.setPickerType}
        pickerType={props.pickerType}
        updateField={props.updateField}
        heightMetric={props.heightMetric}
        weightMetric={props.weightMetric}
      /> : (
        <View style={styles.buttonContainer}>
          <View style={{ alignItems: 'center' }}>
            <Button
              text="NEXT"
              onPress={props.nextStep}
              disabled={!props.nickname || !props.gender || !props.height || !props.weight}
            />
          </View>
          <View style={{ alignItems: 'center', paddingTop: 15 }}>
            <Button
              style={styles._secondaryButton}
              text="BACK"
              textStyle={styles._secondaryButtonText}
              onPress={props.previousStep}
            />
          </View>
        </View>
    ) }
  </View>
);

const { PropTypes } = React;

Profile.propTypes = {
  key: PropTypes.number,
  nextStep: PropTypes.func,
  previousStep: PropTypes.func,
  pickerType: PropTypes.string,
  nickname: PropTypes.string,
  gender: PropTypes.string,
  selectGender: PropTypes.func,
  setPickerType: PropTypes.func,
  birthdate: PropTypes.object,
  height: PropTypes.string,
  weight: PropTypes.weight,
  heightMetric: PropTypes.string,
  weightMetric: PropTypes.string,
  clearPickerType: PropTypes.func,
  updateField: PropTypes.func,
};

export default Profile;
