import React from 'react';

import {
  View,
  Image,
  Linking,
} from 'react-native';
import styles from '../../styles/onBoarding/notifications';
import Button from '../../components/Button';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';
import progressChart from '../../images/profile/progressChart.png';

const Notifications = props => (
  <View key={props.key} onPress={props.onPress} style={styles.container}>
    <View style={styles.imageContainer}>
      <Image source={progressChart} />
    </View>
    <View style={styles.headerTextContainer}>
      <HeadingText size={2}>Stay On Track</HeadingText>
    </View>
    <View style={styles.subTextContainer}>
      <SecondaryText style={styles._subText}>
        We’ll send you notifications to keep you focused on your quest for a better, healthier you.
      </SecondaryText>
    </View>
    <View style={styles.buttonContainer}>
      <View style={{ alignItems: 'center' }}>
        { props.notificationsEnabled ?
          <Button
            style={styles._button}
            onPress={() => Linking.openURL('app-settings:')}
            text="ENABLE"
          />
          :
            <Button style={styles._button} text="ENABLE" disabled />
        }
      </View>
      <View style={{ paddingTop: 15, alignItems: 'center' }}>
        <Button
          style={Object.assign(
            {},
            styles._button,
            {
              borderWidth: 1,
              borderRadius: 5,
              borderColor: 'red',
              backgroundColor: 'white',
            }
          )}
          text={props.notificationsEnabled ? 'NOT NOW' : 'NEXT'}
          textStyle={{ color: 'red' }}
          onPress={props.nextStep}
        />
      </View>
    </View>
  </View>
);

const { PropTypes } = React;

Notifications.propTypes = {
  key: PropTypes.number,
  onPress: PropTypes.func,
  currentStep: PropTypes.number,
  nextStep: PropTypes.func,
  notificationsEnabled: PropTypes.bool,
};

export default Notifications;
