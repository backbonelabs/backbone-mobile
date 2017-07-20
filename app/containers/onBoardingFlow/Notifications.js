import React, { PropTypes } from 'react';
import {
  View,
  Image,
  Linking,
} from 'react-native';
import styles from '../../styles/onBoardingFlow/notifications';
import Button from '../../components/Button';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';
import progressChart from '../../images/onboarding/progressChart.png';

const Notifications = props => {
  const firstButtonProps = { primary: true };

  if (props.notificationsEnabled) {
    delete firstButtonProps.primary;
    firstButtonProps.disabled = true;
  }

  return (
    <View key={props.key} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={progressChart} />
      </View>
      <View style={styles.headerTextContainer}>
        <HeadingText size={2}>Stay On Track</HeadingText>
      </View>
      <View style={styles.subTextContainer}>
        <SecondaryText style={styles._subText}>
          We’ll send you notifications to keep you focused
          on your quest for a better, healthier you.
        </SecondaryText>
      </View>
      <View style={styles.buttonContainer}>
        <View>
          <Button
            style={styles._button}
            onPress={() => Linking.openURL('app-settings:')}
            text="ENABLE"
            {...firstButtonProps}
          />
        </View>
        <View style={{ paddingTop: 15 }}>
          <Button
            style={styles._button}
            text={props.notificationsEnabled ? 'NEXT' : 'NOT NOW'}
            onPress={props.nextStep}
            primary={props.notificationsEnabled}
          />
        </View>
      </View>
    </View>
  );
};

Notifications.propTypes = {
  key: PropTypes.number,
  nextStep: PropTypes.func,
  notificationsEnabled: PropTypes.bool,
};

export default Notifications;
