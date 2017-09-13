import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GuidedTraining from '../containers/GuidedTraining';
import appActions from '../actions/app';
import styles from '../styles/guidedTraining';

const GuidedTrainingHelp = props => {
  const glossary = 'Reps: Reps is short for repetitions. ' +
    'Repetitions defines the number of times to perform an exercise. ' +
    'For example, you do 10 squats, then stop. ' +
    'The 10 squats you performed are considered 10 repetitions. \n\n' +
    'Sets: Sets refers to how many times you will repeat an exercise for the set number of repetitions. ' +
    'For example, you do 10 squats and rest, and then you do another 10 squats and rest. ' +
    'You have now completed two sets of 10 reps.';
  const showGlossary = () => {
    props.showPartialModal({
      title: { caption: 'Glossary' },
      detail: {
        caption: `${glossary}`,
      },
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
