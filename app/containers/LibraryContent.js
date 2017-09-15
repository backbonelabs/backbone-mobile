import React, { PropTypes } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import get from 'lodash/get';
import userActions from '../actions/user';
import BodyText from '../components/BodyText';
import WorkoutView from './WorkoutView';
import styles from '../styles/libraryContent';

const LibraryContent = (props) => {
  const {
    selectedWorkoutId,
    workouts,
  } = props;
  const { favoriteWorkouts = [] } = props.user;
  const workoutIdx = workouts.findIndex(workout => workout._id === selectedWorkoutId);
  const workout = get(workouts, workoutIdx, {});

  let iconName = '';
  if (favoriteWorkouts.includes(selectedWorkoutId)) {
    iconName = 'favorite';
  } else {
    iconName = 'favorite-border';
  }

  const toggleFavorite = () => {
    const { _id } = props.user;
    const newFavoriteWorkouts = favoriteWorkouts.slice();
    const workoutIdIndex = newFavoriteWorkouts.indexOf(selectedWorkoutId);

    if (workoutIdIndex > -1) {
      newFavoriteWorkouts.splice(workoutIdIndex, 1);
    } else {
      newFavoriteWorkouts.push(selectedWorkoutId);
    }

    props.updateUser({
      _id,
      favoriteWorkouts: newFavoriteWorkouts,
    });
  };

  const videoBackgroundColor = props.media === 'video' ? { backgroundColor: 'black' } : {};
  return (
    <View style={[styles.container, videoBackgroundColor]}>
      <View style={styles.header}>
        {props.media === 'image' &&
          <BodyText style={styles.centerText}>{workout.instructions}</BodyText>}
      </View>
      <WorkoutView
        media={props.media}
        navigator={props.navigator}
        workout={workout}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={toggleFavorite} >
          <Icon name={iconName} style={styles.favoriteButton} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

LibraryContent.propTypes = {
  media: PropTypes.oneOf(['image', 'video']),
  navigator: PropTypes.object.isRequired,
  selectedWorkoutId: PropTypes.string,
  updateUser: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    favoriteWorkouts: PropTypes.array,
  }).isRequired,
  workouts: PropTypes.array.isRequired,
};

LibraryContent.defaultProps = {
  media: 'image',
};

const mapStateToProps = (state) => {
  const { workouts, selectedWorkoutId, favoriteWorkouts, user } = state.user;
  return { workouts, selectedWorkoutId, favoriteWorkouts, user };
};

export default connect(mapStateToProps, userActions)(LibraryContent);
