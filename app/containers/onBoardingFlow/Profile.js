import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import styles from '../../styles/onBoarding/profile';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';

const Profile = props => (
  <View key={props.key} onPress={props.onPress} style={styles.container}>
    <View style={styles.headerTextContainer}>
      <HeadingText size={3}>Tell Us About Yourself</HeadingText>
    </View>
    <View style={styles.subTextContainer}>
      <SecondaryText style={styles._subText}>
        Make Backbone more accurate by telling us about yourself. We'll never share your info.
      </SecondaryText>
    </View>
    <View style={styles.genderSelectionContainer}>
      <Text style={styles.primaryButtonText}>Male</Text>
      <Text style={styles.primaryButtonText}>Female</Text>
    </View>
    <View style={styles.profileInputContainer}>
      <Text>Birthdate</Text>
    </View>
    <View style={styles.primaryButtonContainer}>
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const { PropTypes } = React;

Profile.propTypes = {
  key: PropTypes.number,
  onPress: PropTypes.func,
  currentStep: PropTypes.number,
};

export default Profile;
