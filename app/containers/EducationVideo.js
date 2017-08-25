import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Icon from 'react-native-vector-icons/FontAwesome';
import userActions from '../actions/user';
import styles from '../styles/educationVideo';
import VideoPlayer from '../components/VideoPlayer';

class EducationVideo extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    workouts: PropTypes.array,
    selectedWorkoutId: PropTypes.string,
    user: PropTypes.shape({
      _id: PropTypes.string,
      favoriteWorkouts: PropTypes.array,
    }),
  };

  constructor(props) {
    super(props);
    autobind(this);
  }

  componentDidMount() {
    // Run expensive operations after the scene is loaded
    InteractionManager.runAfterInteractions(() => {
      // Start the video
    });
  }

  toggleFavorite() {
    const { selectedWorkoutId } = this.props;
    const { _id: userId, favoriteWorkouts } = this.props.user;
    const newFavoriteWorkouts = favoriteWorkouts.slice();
    const workoutIdIndex = newFavoriteWorkouts.indexOf(selectedWorkoutId);

    if (workoutIdIndex > -1) {
      newFavoriteWorkouts.splice(workoutIdIndex, 1);
    } else {
      newFavoriteWorkouts.push(selectedWorkoutId);
    }

    this.props.dispatch(userActions.updateUser({
      _id: userId,
      favoriteWorkouts: newFavoriteWorkouts,
    }));
  }

  render() {
    const {
      selectedWorkoutId,
      workouts,
    } = this.props;
    const { favoriteWorkouts = [] } = this.props.user;
    const workoutIdx = workouts.findIndex(workout => workout._id === selectedWorkoutId);
    const videoUrl = get(workouts, [workoutIdx, 'videoUrl'], '');

    let iconName = '';
    if (favoriteWorkouts.includes(selectedWorkoutId)) {
      iconName = 'heart';
    } else {
      iconName = 'heart-o';
    }

    return (
      <View style={styles.mainContainer}>
        <View style={styles.videoContainer}>
          <VideoPlayer
            video={{ uri: videoUrl }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this.toggleFavorite} >
            <Icon name={iconName} style={styles.favoriteButton} size={styles.$heartIconSize} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { workouts, selectedWorkoutId, favoriteWorkouts, user } = state.user;
  return { workouts, selectedWorkoutId, favoriteWorkouts, user };
};

export default connect(mapStateToProps)(EducationVideo);
