import React from 'react';

import {
  View,
} from 'react-native';
import HeadingText from '../../components/HeadingText';
import Spinner from '../../components/Spinner';
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
      /> : (
        <View style={styles.buttonContainer}>
          <View>
            { props.isUpdating ?
              <Spinner />
              :
                <Button
                  style={{ alignSelf: 'center' }}
                  text="SAVE"
                  onPress={props.saveData}
                  disabled={!props.nickname || !props.gender || !props.height || !props.weight}
                />
            }
          </View>
          <View style={{ paddingTop: 15 }}>
            <Button
              style={{ alignSelf: 'center' }}
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
  previousStep: PropTypes.func,
  pickerType: PropTypes.string,
  nickname: PropTypes.string,
  gender: PropTypes.string,
  setPickerType: PropTypes.func,
  birthdate: PropTypes.object,
  height: PropTypes.object,
  weight: PropTypes.object,
  updateField: PropTypes.func,
  saveData: PropTypes.func,
  isUpdating: PropTypes.bool,
};

export default Profile;
