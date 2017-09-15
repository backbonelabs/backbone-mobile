import React, { Component, PropTypes } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import PostureIntro from '../components/posture/PostureIntro';
import VideoPlayer from '../components/VideoPlayer';
import videoIcon from '../images/video-icon-blue.png';
import routes from '../routes';
import styles from '../styles/workoutView';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import { getWorkoutGifFilePath } from '../utils/trainingUtils';

const { workoutTypes } = constants;

class WorkoutView extends Component {
  static propTypes = {
    media: PropTypes.oneOf(['image', 'video']),
    navigator: PropTypes.object.isRequired,
    training: PropTypes.shape({
      selectedLevelIdx: PropTypes.number,
    }).isRequired,
    workout: PropTypes.shape({
      gifFilename: PropTypes.string,
      videoUrl: PropTypes.string,
      title: PropTypes.string,
      type: PropTypes.number,
    }),
    isGuidedTraining: PropTypes.bool,
  }

  static defaultProps = {
    media: 'image',
  };

  constructor(props) {
    super(props);
    autobind(this);
  }

  _navigateToVideo() {
    Mixpanel.trackWithProperties('workoutVideoIconClick',
      {
        workout: this.props.workout.title,
        videoUrl: this.props.workout.videoUrl,
      });

    this.props.navigator.push({
      ...routes.libraryContent,
      title: this.props.workout.title,
      props: {
        media: 'video',
      },
    });
  }

  render() {
    const workout = this.props.workout;

    // If the workout is a posture session, display PostureIntro. Otherwise, display workout media
    const isPostureSession = workout.type === workoutTypes.POSTURE;
    let content;

    if (isPostureSession) {
      content = (
        <PostureIntro
          duration={workout.duration}
          isGuidedTraining={this.props.isGuidedTraining ? this.props.isGuidedTraining : false}
          navigator={this.props.navigator}
        />
      );
    } else if (this.props.media === 'image' && workout.gifFilename) {
      content = (
        <View style={styles.gifContainer}>
          <Image source={{ uri: getWorkoutGifFilePath(workout.gifFilename) }} style={styles.gif}>
            <TouchableOpacity
              style={styles.videoLink}
              onPress={this._navigateToVideo}
            >
              <Image source={videoIcon} style={styles.videoIcon} />
            </TouchableOpacity>
          </Image>
        </View>
      );
    } else if (this.props.media === 'video' && workout.videoUrl) {
      content = (
        <View style={styles.videoPlayerContainer}>
          <VideoPlayer video={{ uri: workout.videoUrl }} defaultFullscreen autoplay />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }
}

const mapStateToProps = ({ training }) => ({ training });

export default connect(mapStateToProps)(WorkoutView);
