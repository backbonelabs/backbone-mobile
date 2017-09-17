import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import GuidedTraining from '../containers/GuidedTraining';
import appActions from '../actions/app';
import styles from '../styles/guidedTraining';

const glossaryTexts = [
  ' is short for repetitions. ' +
  'Repetitions refer to the number of times to perform an exercise. ' +
  'For example, you do 10 squats, then stop. ' +
  'The 10 squats you performed are considered 10 repetitions.\n\n',
  ' refer to how many times you will repeat an exercise ' +
  'for the recommended number of ',
  '. For example, you do 10 squats and rest, and then you do another 10 squats and rest. ' +
  'You have now completed two ',
  ' of 10 ',
  '.',
];

const GuidedTrainingHelp = props => {
  const showGlossary = () => {
    props.showPartialModal({
      topView: (
        <View style={styles.glossaryContainer}>
          <View style={styles.glossaryTextContainer}>
            <HeadingText size={1} style={styles.glossaryTitleText}>
              Glossary
            </HeadingText>
          </View>
          <View style={styles.glossaryTextContainer}>
            <BodyText style={styles.glossaryDetailText}>
              <Text style={{ fontWeight: 'bold' }}>
                Reps: Reps
              </Text>
              {glossaryTexts[0]}
              <Text style={{ fontWeight: 'bold' }}>
                Sets: Sets
              </Text>
              {glossaryTexts[1]}
              <Text style={{ fontWeight: 'bold' }}>
                reps
              </Text>
              {glossaryTexts[2]}
              <Text style={{ fontWeight: 'bold' }}>
                sets
              </Text>
              {glossaryTexts[3]}
              <Text style={{ fontWeight: 'bold' }}>
                reps
              </Text>
              {glossaryTexts[4]}
            </BodyText>
          </View>
        </View>
      ),
      buttons: [{ caption: 'CLOSE' }],
      backButtonHandler: () => {
        props.hidePartialModal();
      },
    });
  };

  return (
    <TouchableOpacity onPress={showGlossary}>
      <Icon
        name="help-outline"
        style={styles.helpIcon}
      />
    </TouchableOpacity>
  );
};

GuidedTrainingHelp.propTypes = {
  showPartialModal: PropTypes.func.isRequired,
  hidePartialModal: PropTypes.func.isRequired,
};

export default {
  name: 'guidedWorkout',
  component: GuidedTraining,
  showLeftComponent: true,
  showRightComponent: true,
  rightComponent: connect(null, { ...appActions })(GuidedTrainingHelp),
};
