import React, { PropTypes } from 'react';
import {
  View,
} from 'react-native';
import HeadingText from '../../components/HeadingText';
import Spinner from '../../components/Spinner';
import styles from '../../styles/onBoarding/profile';
import Button from '../../components/Button';
import ProfileGender from './profile/ProfileGender';
import ProfileBody from './profile/ProfileBody';
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
      updateField={props.updateField}
    />
    <ProfileBody
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
      /> : (
        <View style={styles.buttonContainer}>
          { props.isUpdating ?
            <Spinner />
            :
              <Button
                primary
                style={styles._button}
                text="SAVE"
                onPress={props.saveData}
                disabled={!props.nickname || !props.gender || !props.height || !props.weight}
              />
          }
          <View style={{ paddingTop: 15 }}>
            <Button
              style={styles._button}
              text="BACK"
              onPress={props.previousStep}
            />
          </View>
        </View>
    ) }
  </View>
);

Profile.propTypes = {
  key: PropTypes.number,
  previousStep: PropTypes.func,
  pickerType: PropTypes.string,
  nickname: PropTypes.string,
  gender: PropTypes.number,
  setPickerType: PropTypes.func,
  birthdate: PropTypes.object,
  height: PropTypes.object,
  weight: PropTypes.object,
  updateField: PropTypes.func,
  saveData: PropTypes.func,
  isUpdating: PropTypes.bool,
};

export default Profile;
