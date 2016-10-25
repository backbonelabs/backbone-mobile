import React from 'react';

import {
  View,
  Text,
  DatePickerIOS,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Input from '../../components/Input';
import styles from '../../styles/onBoarding/profile';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';

const Gender = props => (
  <View style={styles.genderSelectionContainer}>
    { props.gender === 'female' ?
      undefined :
        <TouchableOpacity style={styles.gender} onPress={() => props.selectGender('male')}>
          <Icon name="male" size={40} color="red" />
          <Text style={styles.genderText}>Male</Text>
        </TouchableOpacity>
    }
    { props.gender === 'male' ?
      undefined :
        <TouchableOpacity style={styles.gender} onPress={() => props.selectGender('female')}>
          <Icon name="female" size={40} color="red" />
          <Text style={styles.genderText}>Female</Text>
        </TouchableOpacity>
    }
    { props.gender &&
      <Input
        defaultValue=""
      />
    }
  </View>
);

const ProfileInformation = props => (
  <View style={styles.profileInfoContainer}>
    <TouchableOpacity style={styles.birthdate} onPress={() => props.setPickerType('birthdate')}>
      <Text style={{ marginLeft: 10 }}>Birthdate</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.height} onPress={() => props.setPickerType('height')}>
      <Text style={{ marginLeft: 10 }}>Height</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.weight} onPress={() => props.setPickerType('weight')}>
      <Text style={{ marginLeft: 10 }}>Weight</Text>
    </TouchableOpacity>
  </View>
);

const InformationPicker = props => {
  switch (props.pickerType) {
    case 'birthdate':
      return (<DatePickerIOS
        date={props.birthdate}
        mode="date"
        onDateChange={props.updateBirthdate}
      />);
    default:
      return <View />;
  }
};

const Profile = props => (
  <View key={props.key} onPress={props.onPress} style={[styles.container]}>
    <View style={{ flex: 1 }}>
      <View style={styles.textContainer}>
        <HeadingText style={styles._text} size={3}>
          Tell Us About Yourself
        </HeadingText>
        <SecondaryText style={styles._text}>
          Make Backbone more accurate by telling us about yourself. We'll never share your info.
        </SecondaryText>
      </View>
      <Gender gender={props.gender} selectGender={props.selectGender} />
      <ProfileInformation setPickerType={props.setPickerType} />
      { props.pickerType ?
        <InformationPicker birthdate={props.birthdate} updateBirthdate={props.updateBirthdate} pickerType={props.pickerType} /> :
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>NEXT</Text>
            </TouchableOpacity>
          </View>
      }
    </View>
  </View>
);

const { PropTypes } = React;

Profile.propTypes = {
  key: PropTypes.number,
  onPress: PropTypes.func,
  gender: PropTypes.string,
  selectGender: PropTypes.func,
  currentStep: PropTypes.number,
  birthdate: PropTypes.object,
  updateBirthdate: PropTypes.func,
  setPickerType: PropTypes.func,
  pickerType: PropTypes.string,
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

ProfileInformation.propTypes = {
  setPickerType: PropTypes.func,
  pickerType: PropTypes.string,
};

Gender.propTypes = {
  gender: PropTypes.string,
  selectGender: PropTypes.func,
};

InformationPicker.propTypes = {
  birthdate: PropTypes.object,
  updateBirthdate: PropTypes.func,
  pickerType: PropTypes.string,
};

export default Profile;
